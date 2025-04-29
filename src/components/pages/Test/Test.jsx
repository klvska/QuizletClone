import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Test.css";

const Test = () => {
  const { setId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);

  // Pobierz konfigurację z location state
  const config = location.state?.config;

  useEffect(() => {
    // Jeśli nie ma konfiguracji, przekieruj do strony konfiguracji
    if (!config) {
      navigate(`/sets/${setId}/test-config`);
      return;
    }

    const fetchSet = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/sets/${setId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Przygotuj pytania na podstawie konfiguracji
        const preparedQuestions = prepareQuestions(response.data.cards, config);
        setQuestions(preparedQuestions);
        setUserAnswers(new Array(preparedQuestions.length).fill(null));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching set:", error);
        setError(
          error.response?.data?.error || "Nie udało się załadować zestawu"
        );
        setLoading(false);
      }
    };

    fetchSet();
  }, [setId, config, navigate]);

  const prepareQuestions = (cards, config) => {
    // Wybierz losowo karty zgodnie z liczbą pytań w konfiguracji
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    const selectedCards = shuffledCards.slice(0, config.questionCount);

    // Przygotuj pytania różnych typów
    return selectedCards.map((card) => {
      const questionTypes = Object.entries(config.types)
        .filter(([_, enabled]) => enabled)
        .map(([type]) => type);

      const randomType =
        questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let question;
      if (randomType === "trueFalse") {
        // Dla pytań prawda/fałsz, losowo wybierz czy pokazać prawdziwą czy fałszywą odpowiedź
        const showCorrectAnswer = Math.random() < 0.5;
        const incorrectAnswer = shuffledCards
          .filter((c) => c.id !== card.id)
          .sort(() => Math.random() - 0.5)[0].answer;

        question = {
          card,
          type: randomType,
          displayedAnswer: showCorrectAnswer ? card.answer : incorrectAnswer,
          correctAnswer: showCorrectAnswer,
        };
      } else {
        question = {
          card,
          type: randomType,
          options: generateOptions(card, cards, randomType),
        };
      }

      return question;
    });
  };

  const generateOptions = (card, allCards, type) => {
    switch (type) {
      case "trueFalse":
        // Dla pytań prawda/fałsz, odpowiedź jest zawsze parą prawda/fałsz
        return [
          { text: "Prawda", value: true },
          { text: "Fałsz", value: false },
        ];
      case "multipleChoice": {
        // Wybierz 3 losowe błędne odpowiedzi z innych kart
        const otherAnswers = allCards
          .filter((c) => c.id !== card.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((c) => c.answer);

        // Dodaj poprawną odpowiedź i pomieszaj
        return [...otherAnswers, card.answer]
          .sort(() => Math.random() - 0.5)
          .map((text) => ({ text }));
      }
      case "matching": {
        // Wybierz 3 dodatkowe pary pytanie-odpowiedź
        const otherPairs = allCards
          .filter((c) => c.id !== card.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        // Przygotuj tablicę pytań i odpowiedzi
        const questions = [card.question, ...otherPairs.map((c) => c.question)];
        const answers = [card.answer, ...otherPairs.map((c) => c.answer)].sort(
          () => Math.random() - 0.5
        );

        return {
          questions,
          answers,
        };
      }
      case "written":
      default:
        return null;
    }
  };

  const calculateStats = (questions, userAnswers) => {
    let correct = 0;
    let incorrect = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    const progress = {};

    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      let isCorrect = false;

      switch (question.type) {
        case "trueFalse":
          // Dla pytań prawda/fałsz, sprawdź czy odpowiedź użytkownika zgadza się z poprawną odpowiedzią
          isCorrect = userAnswer === question.correctAnswer;
          break;
        case "matching":
          // Dla dopasowywania par, sprawdź czy wybrana odpowiedź pasuje do pytania
          isCorrect = userAnswer === question.card.answer;
          break;
        case "written":
          // Dla pytań otwartych, porównaj teksty po normalizacji
          isCorrect =
            userAnswer?.toLowerCase().trim() ===
            question.card.answer.toLowerCase().trim();
          break;
        case "multipleChoice":
          // Dla pytań wielokrotnego wyboru, porównaj dokładnie teksty
          isCorrect = userAnswer === question.card.answer;
          break;
      }

      if (isCorrect) {
        correct++;
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        incorrect++;
        currentStreak = 0;
      }

      // Zapisz postęp dla każdej karty
      const cardId = question.card.id;
      if (!progress[cardId]) {
        progress[cardId] = { correct: 0, attempts: 0 };
      }
      progress[cardId].attempts++;
      if (isCorrect) {
        progress[cardId].correct++;
      }
    });

    return {
      stats: {
        correct,
        incorrect,
        streak: maxStreak,
      },
      progress,
    };
  };

  const handleAnswer = async (answer) => {
    // Zapisz odpowiedź użytkownika
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);

    // Przejdź do następnego pytania lub zakończ test
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Oblicz statystyki i zapisz je
      const results = calculateStats(questions, newAnswers);

      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `http://localhost:3001/test/${setId}/complete`,
          {
            correctAnswers: results.stats.correct,
            incorrectAnswers: results.stats.incorrect,
            timeSpent: 0, // TODO: dodać śledzenie czasu
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Zapisz wyniki
        await axios.post(
          `http://localhost:3001/results/${setId}/save`,
          {
            streak: results.stats.streak,
            timeSpent: 0, // TODO: dodać śledzenie czasu
            correctAnswers: results.stats.correct,
            incorrectAnswers: results.stats.incorrect,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (error) {
        console.error("Error saving results:", error);
      }

      // Przekieruj do wyników
      navigate(`/sets/${setId}/results`, {
        state: results,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0a092d] text-white">
        <div className="text-xl">Ładowanie...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#0a092d] text-white">
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate(`/sets/${setId}`)}
          className="px-4 py-2 bg-[#4255ff] text-white rounded-full hover:bg-[#423ed8] transition-all duration-300"
        >
          Wróć do zestawu
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0a092d] text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#2e3856] rounded-xl p-6">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span>Postęp</span>
              <span>
                {currentQuestionIndex + 1} / {questions.length}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Pytanie */}
          <div className="mb-8">
            {currentQuestion.type === "trueFalse" ? (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  Czy to jest poprawna odpowiedź dla tego pytania?
                </h2>
                <div className="bg-[#1a1d28] p-6 rounded-lg mb-6">
                  <div className="text-xl mb-4">Pytanie:</div>
                  <div className="text-lg mb-6">
                    {currentQuestion.card.question}
                  </div>
                  <div className="text-xl mb-4">Odpowiedź:</div>
                  <div className="text-lg">
                    {currentQuestion.displayedAnswer}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="answer-button bg-[#1a1d28] py-4 text-center text-lg font-semibold"
                  >
                    Prawda
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    className="answer-button bg-[#1a1d28] py-4 text-center text-lg font-semibold"
                  >
                    Fałsz
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4">
                  {currentQuestion.type === "matching"
                    ? "Dopasuj odpowiednie pary"
                    : currentQuestion.card.question}
                </h2>

                {currentQuestion.type === "multipleChoice" && (
                  <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option.text)}
                        className="answer-button bg-[#1a1d28]"
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.type === "matching" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      {currentQuestion.options.questions.map(
                        (question, index) => (
                          <div
                            key={index}
                            className="p-4 bg-[#1a1d28] rounded-lg"
                          >
                            {question}
                          </div>
                        )
                      )}
                    </div>
                    <div className="space-y-4">
                      {currentQuestion.options.answers.map((answer, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswer(answer)}
                          className="answer-button bg-[#1a1d28]"
                        >
                          {answer}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentQuestion.type === "written" && (
                  <div className="space-y-4">
                    <textarea
                      className="w-full p-4 bg-[#1a1d28] rounded-lg resize-none"
                      rows="4"
                      placeholder="Wpisz swoją odpowiedź..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAnswer(e.target.value);
                        }
                      }}
                    />
                    <button
                      onClick={(e) =>
                        handleAnswer(e.target.previousSibling.value)
                      }
                      className="px-6 py-2 bg-[#4255ff] text-white rounded-lg hover:bg-[#2b3bcc] transition-colors"
                    >
                      Zatwierdź
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
