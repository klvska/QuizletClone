import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import process from "process";

const prisma = new PrismaClient();
const app = express();
const port = 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

app.use(cors());
app.use(express.json());

// Middleware do autoryzacji
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Brak tokenu autoryzacyjnego" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Nieprawidłowy token" });
    }
    req.user = user;
    next();
  });
};

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

// Endpointy dla użytkowników
app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: "Email już istnieje" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        userStats: {
          create: {},
        },
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { userStats: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Nieprawidłowe dane logowania" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Nieprawidłowe dane logowania" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ user, token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Endpointy dla setów
app.post("/sets", authenticateToken, async (req, res) => {
  const { title, description, isPublic, cards } = req.body;
  try {
    const set = await prisma.set.create({
      data: {
        title,
        description,
        isPublic,
        userId: req.user.userId,
        cards: {
          create: cards,
        },
      },
      include: {
        cards: true,
      },
    });

    // Aktualizuj statystyki użytkownika
    await prisma.userStats.update({
      where: { userId: req.user.userId },
      data: {
        totalSets: { increment: 1 },
        totalCards: { increment: cards.length },
      },
    });

    res.json(set);
  } catch (error) {
    console.error("Error creating set:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/sets", authenticateToken, async (req, res) => {
  try {
    const sets = await prisma.set.findMany({
      where: {
        OR: [{ isPublic: true }, { userId: req.user.userId }],
      },
      include: {
        cards: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
    res.json(sets);
  } catch (error) {
    console.error("Error fetching sets:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/sets/:setId", authenticateToken, async (req, res) => {
  try {
    const setId = parseInt(req.params.setId);

    if (isNaN(setId)) {
      return res.status(400).json({ error: "Nieprawidłowe ID zestawu" });
    }

    const set = await prisma.set.findUnique({
      where: {
        id: setId,
      },
      include: {
        cards: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!set) {
      return res.status(404).json({ error: "Zestaw nie został znaleziony" });
    }

    // Sprawdź, czy użytkownik ma dostęp do zestawu
    if (!set.isPublic && set.userId !== req.user.userId) {
      return res.status(403).json({ error: "Brak dostępu do tego zestawu" });
    }

    res.json(set);
  } catch (error) {
    console.error("Error fetching set:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Endpointy dla quizów
app.post("/quizzes", authenticateToken, async (req, res) => {
  const {
    title,
    description,
    timeLimit,
    maxAttempts,
    passingScore,
    isPublic,
    setId,
  } = req.body;
  try {
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        timeLimit,
        maxAttempts,
        passingScore,
        isPublic,
        userId: req.user.userId,
        setId,
      },
    });

    // Aktualizuj statystyki użytkownika
    await prisma.userStats.update({
      where: { userId: req.user.userId },
      data: {
        totalQuizzes: { increment: 1 },
      },
    });

    res.json(quiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Dodajemy nowy endpoint do pobierania quizów
app.get("/quizzes", authenticateToken, async (req, res) => {
  try {
    const { setId } = req.query;
    const quizzes = await prisma.quiz.findMany({
      where: {
        setId: setId ? parseInt(setId) : undefined,
        OR: [{ isPublic: true }, { userId: req.user.userId }],
      },
    });
    res.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post("/quizzes/:quizId/attempt", authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const { answers, timeSpent, score } = req.body;
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: parseInt(quizId) },
      include: { set: { include: { cards: true } } },
    });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz nie został znaleziony" });
    }

    const totalQuestions = quiz.set.cards.length;
    const correctAnswers = Math.round((score * totalQuestions) / 100);
    const incorrectAnswers = totalQuestions - correctAnswers;

    // Oblicz streak na podstawie odpowiedzi
    let currentStreak = 0;
    let maxStreak = 0;
    answers.forEach((answer) => {
      if (answer.isCorrect) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user.userId,
        quizId: parseInt(quizId),
        answers,
        timeSpent,
        score,
        streak: maxStreak,
      },
    });

    // Pobierz aktualne statystyki użytkownika
    const userStats = await prisma.userStats.findUnique({
      where: { userId: req.user.userId },
    });

    // Sprawdź, czy to jest quiz wykonany dzisiaj
    const today = new Date();
    const lastQuizDate = userStats.lastQuizDate
      ? new Date(userStats.lastQuizDate)
      : null;
    const isQuizToday =
      lastQuizDate &&
      lastQuizDate.getDate() === today.getDate() &&
      lastQuizDate.getMonth() === today.getMonth() &&
      lastQuizDate.getFullYear() === today.getFullYear();

    // Aktualizuj statystyki użytkownika
    await prisma.userStats.update({
      where: { userId: req.user.userId },
      data: {
        correctAnswers: { increment: correctAnswers },
        incorrectAnswers: { increment: incorrectAnswers },
        bestQuizScore: score > (userStats.bestQuizScore || 0) ? score : userStats.bestQuizScore,
        longestStreak: maxStreak > (userStats.longestStreak || 0) ? maxStreak : userStats.longestStreak,
        todayQuizzes: isQuizToday ? { increment: 1 } : 1,
        lastQuizDate: today,
        totalStudyTime: { increment: Math.ceil(timeSpent / 60) }, // konwersja sekund na minuty
      },
    });

    res.json(attempt);
  } catch (error) {
    console.error("Error creating quiz attempt:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/user/stats", authenticateToken, async (req, res) => {
  try {
    // Pobierz podstawowe statystyki użytkownika
    const stats = await prisma.userStats.findUnique({
      where: { userId: req.user.userId },
    });

    // Pobierz wszystkie próby quizów użytkownika wraz z quizami i zestawami
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user.userId },
      include: {
        quiz: {
          include: {
            set: {
              include: {
                cards: true,
              },
            },
          },
        },
      },
    });

    // Oblicz sumę poprawnych i niepoprawnych odpowiedzi z quizów
    const quizStats = quizAttempts.reduce(
      (acc, attempt) => {
        const totalQuestions = attempt.quiz.set.cards.length;
        const correctAnswers = Math.round(
          (attempt.score * totalQuestions) / 100
        );
        const incorrectAnswers = totalQuestions - correctAnswers;

        acc.correctAnswers += correctAnswers;
        acc.incorrectAnswers += incorrectAnswers;
        return acc;
      },
      { correctAnswers: 0, incorrectAnswers: 0 }
    );

    // Zwróć połączone statystyki
    res.json({
      ...stats,
      correctAnswers: stats.correctAnswers + quizStats.correctAnswers,
      incorrectAnswers: stats.incorrectAnswers + quizStats.incorrectAnswers,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Endpointy dla postępu nauki
app.get("/sets/:setId/progress", authenticateToken, async (req, res) => {
  try {
    const setId = parseInt(req.params.setId);
    if (isNaN(setId)) {
      return res.status(400).json({ error: "Nieprawidłowe ID zestawu" });
    }

    // Pobierz wszystkie karty z zestawu wraz z ich postępem dla zalogowanego użytkownika
    const cards = await prisma.card.findMany({
      where: {
        setId: setId,
      },
      include: {
        progress: {
          where: {
            userId: req.user.userId,
          },
        },
      },
    });

    // Przekształć dane do formatu oczekiwanego przez frontend
    const progress = {};
    cards.forEach((card) => {
      if (card.progress.length > 0) {
        progress[card.id] = {
          mastery: card.progress[0].mastery,
          attempts: card.progress[0].attempts,
          correct: card.progress[0].correct,
        };
      }
    });

    res.json({ progress });
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post("/sets/:setId/progress", authenticateToken, async (req, res) => {
  try {
    const setId = parseInt(req.params.setId);
    const { cardId, progress } = req.body;

    if (isNaN(setId) || !cardId) {
      return res.status(400).json({ error: "Nieprawidłowe dane" });
    }

    // Sprawdź, czy karta należy do zestawu
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        setId: setId,
      },
    });

    if (!card) {
      return res.status(404).json({ error: "Karta nie została znaleziona" });
    }

    // Aktualizuj lub utwórz postęp dla karty
    const cardProgress = await prisma.cardProgress.upsert({
      where: {
        cardId_userId: {
          cardId: cardId,
          userId: req.user.userId,
        },
      },
      update: {
        mastery: progress.mastery,
        attempts: progress.attempts,
        correct: progress.correct,
      },
      create: {
        cardId: cardId,
        userId: req.user.userId,
        mastery: progress.mastery,
        attempts: progress.attempts,
        correct: progress.correct,
      },
    });

    res.json(cardProgress);
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Endpoint dla ukończenia testu
app.post("/test/:setId/complete", authenticateToken, async (req, res) => {
  const { correctAnswers, incorrectAnswers, timeSpent } = req.body;
  const setId = parseInt(req.params.setId);

  try {
    // Sprawdź czy zestaw istnieje
    const set = await prisma.set.findUnique({
      where: { id: setId },
    });

    if (!set) {
      return res.status(404).json({ error: "Zestaw nie został znaleziony" });
    }

    // Pobierz aktualne statystyki użytkownika
    const userStats = await prisma.userStats.findUnique({
      where: { userId: req.user.userId },
    });

    // Sprawdź, czy to jest test wykonany dzisiaj
    const today = new Date();
    const lastTestDate = userStats.lastQuizDate
      ? new Date(userStats.lastQuizDate)
      : null;
    const isTestToday =
      lastTestDate &&
      lastTestDate.getDate() === today.getDate() &&
      lastTestDate.getMonth() === today.getMonth() &&
      lastTestDate.getFullYear() === today.getFullYear();

    // Oblicz wynik procentowy
    const totalAnswers = correctAnswers + incorrectAnswers;
    const score = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    // Aktualizuj statystyki użytkownika
    await prisma.userStats.update({
      where: { userId: req.user.userId },
      data: {
        correctAnswers: { increment: correctAnswers },
        incorrectAnswers: { increment: incorrectAnswers },
        totalQuizzes: { increment: 1 },
        todayQuizzes: isTestToday ? { increment: 1 } : 1,
        lastQuizDate: today,
        totalStudyTime: { increment: Math.ceil(timeSpent / 60) }, // konwersja sekund na minuty
        bestQuizScore: score > (userStats.bestQuizScore || 0) ? score : userStats.bestQuizScore,
      },
    });

    res.json({ message: "Statystyki zaktualizowane pomyślnie" });
  } catch (error) {
    console.error("Error updating test stats:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Endpoint dla ukończenia trybu nauki
app.post("/learn/:setId/complete", authenticateToken, async (req, res) => {
  const { cardsLearned, timeSpent, masteredCards } = req.body;
  const setId = parseInt(req.params.setId);

  try {
    // Sprawdź czy zestaw istnieje
    const set = await prisma.set.findUnique({
      where: { id: setId },
    });

    if (!set) {
      return res.status(404).json({ error: "Zestaw nie został znaleziony" });
    }

    // Pobierz aktualne statystyki użytkownika
    const userStats = await prisma.userStats.findUnique({
      where: { userId: req.user.userId },
    });

    // Sprawdź, czy to jest sesja nauki wykonana dzisiaj
    const today = new Date();
    const lastLearnDate = userStats.lastLearnDate
      ? new Date(userStats.lastLearnDate)
      : null;
    const isLearnToday =
      lastLearnDate &&
      lastLearnDate.getDate() === today.getDate() &&
      lastLearnDate.getMonth() === today.getMonth() &&
      lastLearnDate.getFullYear() === today.getFullYear();

    // Aktualizuj statystyki użytkownika
    await prisma.userStats.update({
      where: { userId: req.user.userId },
      data: {
        totalCards: { increment: cardsLearned },
        masteredCards: { increment: masteredCards },
        totalLearnSessions: { increment: 1 },
        todayLearnSessions: isLearnToday ? { increment: 1 } : 1,
        lastLearnDate: today,
        totalStudyTime: { increment: Math.ceil(timeSpent / 60) }, // konwersja sekund na minuty
      },
    });

    res.json({ message: "Statystyki zaktualizowane pomyślnie" });
  } catch (error) {
    console.error("Error updating learn stats:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Endpoint dla zapisania wyników
app.post("/results/:setId/save", authenticateToken, async (req, res) => {
  const { streak, timeSpent } = req.body;

  try {
    // Pobierz aktualne statystyki użytkownika
    const userStats = await prisma.userStats.findUnique({
      where: { userId: req.user.userId },
    });

    // Aktualizuj statystyki użytkownika
    await prisma.userStats.update({
      where: { userId: req.user.userId },
      data: {
        longestStreak: streak > (userStats.longestStreak || 0) ? streak : userStats.longestStreak,
        totalStudyTime: { increment: Math.ceil(timeSpent / 60) }, // konwersja sekund na minuty
      },
    });

    res.json({ message: "Statystyki zaktualizowane pomyślnie" });
  } catch (error) {
    console.error("Error saving results:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
