import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const QUESTION_TYPES = {
  WRITE: "write",
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
};

const Learn = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [progress, setProgress] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [questionType, setQuestionType] = useState(QUESTION_TYPES.WRITE);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    streak: 0,
  });
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchSet = async () => {
      try {
        if (!setId) {
          setError("Nieprawidłowe ID zestawu");
          setLoading(false);
          return;
        }

        const numericSetId = parseInt(setId);
        if (isNaN(numericSetId)) {
          setError("Nieprawidłowe ID zestawu");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Nie jesteś zalogowany");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:3001/sets/${numericSetId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const shuffledCards = [...response.data.cards].sort(
          () => Math.random() - 0.5
        );
        setCards(shuffledCards);
        initializeProgress(shuffledCards);
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
  }, [setId]);

  const initializeProgress = (cards) => {
    const initialProgress = {};
    cards.forEach((card) => {
      initialProgress[card.id] = {
        mastery: 0,
        attempts: 0,
        correct: 0,
      };
    });
    setProgress(initialProgress);
  };

  const generateQuestionType = (card) => {
    const cardProgress = progress[card.id];
    if (!cardProgress || cardProgress.attempts === 0) {
      return QUESTION_TYPES.MULTIPLE_CHOICE;
    }

    const mastery = cardProgress.correct / cardProgress.attempts;
    if (mastery < 0.3) {
      return QUESTION_TYPES.MULTIPLE_CHOICE;
    } else if (mastery < 0.7) {
      return QUESTION_TYPES.TRUE_FALSE;
    }
    return QUESTION_TYPES.WRITE;
  };

  const generateOptions = (correctAnswer) => {
    const otherCards = cards.filter((card) => card.answer !== correctAnswer);
    const shuffledCards = [...otherCards].sort(() => Math.random() - 0.5);
    const wrongOptions = shuffledCards.slice(0, 3).map((card) => card.answer);
    const allOptions = [...wrongOptions, correctAnswer].sort(
      () => Math.random() - 0.5
    );
    setOptions(allOptions);
  };

  useEffect(() => {
    if (cards.length > 0) {
      const currentCard = cards[currentCardIndex];
      const type = generateQuestionType(currentCard);
      setQuestionType(type);
      if (type === QUESTION_TYPES.MULTIPLE_CHOICE) {
        generateOptions(currentCard.answer);
      }
    }
  }, [currentCardIndex, cards]);

  const checkAnswer = async (submittedAnswer) => {
    const currentCard = cards[currentCardIndex];
    const isCorrect =
      submittedAnswer.toLowerCase().trim() ===
      currentCard.answer.toLowerCase().trim();

    // Aktualizuj postęp
    const cardProgress = progress[currentCard.id];
    const newProgress = {
      ...progress,
      [currentCard.id]: {
        ...cardProgress,
        attempts: cardProgress.attempts + 1,
        correct: cardProgress.correct + (isCorrect ? 1 : 0),
        mastery:
          (cardProgress.correct + (isCorrect ? 1 : 0)) /
          (cardProgress.attempts + 1),
      },
    };
    setProgress(newProgress);

    // Aktualizuj statystyki
    const newStats = {
      ...stats,
      correct: stats.correct + (isCorrect ? 1 : 0),
      incorrect: stats.incorrect + (isCorrect ? 0 : 1),
      streak: isCorrect ? stats.streak + 1 : 0,
    };
    setStats(newStats);

    setFeedback({
      isCorrect,
      correctAnswer: currentCard.answer,
    });

    setTimeout(async () => {
      setFeedback(null);
      setCurrentAnswer("");
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        // Oblicz liczbę opanowanych kart
        const masteredCards = Object.values(newProgress).filter(
          (p) => p.mastery >= 0.7
        ).length;

        // Oblicz czas spędzony na nauce (w sekundach)
        const timeSpent = Math.round((Date.now() - startTime) / 1000);

        // Wyślij statystyki do serwera
        try {
          const token = localStorage.getItem("token");
          await axios.post(
            `http://localhost:3001/learn/${setId}/complete`,
            {
              cardsLearned: cards.length,
              timeSpent,
              masteredCards,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        } catch (error) {
          console.error("Error updating stats:", error);
        }

        // Zakończ sesję nauki
        navigate(`/sets/${setId}/results`, {
          state: {
            stats: newStats,
            progress: newProgress,
            timeSpent,
          },
        });
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a092d] flex items-center justify-center text-white">
        <div className="text-xl">Ładowanie...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a092d] flex flex-col items-center justify-center text-white">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(`/sets/${setId}`)}
          className="px-6 py-3 bg-[#4255ff] text-white rounded-full hover:bg-[#3244cc] transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#4255ff]/20"
        >
          Wróć do zestawu
        </button>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-[#0a092d] p-8 flex flex-col items-center text-white">
      <div className="w-full max-w-4xl mb-8 bg-[#2e3856] p-6 rounded-xl shadow-lg">
        <div className="w-full h-2 bg-[#1a1b2e] rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-[#4255ff] transition-all duration-300"
            style={{ width: `${(currentCardIndex / cards.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[#a8b3cf] text-lg">
          <span>Poprawne: {stats.correct}</span>
          <span>Seria: {stats.streak}</span>
        </div>
      </div>

      <div className="w-full max-w-4xl min-h-[400px] bg-[#2e3856] p-8 rounded-xl shadow-lg relative flex flex-col">
        <h2 className="text-3xl font-medium text-center m-auto">
          {currentCard.question}
        </h2>

        {questionType === QUESTION_TYPES.WRITE && (
          <div className="mt-auto flex flex-col gap-4">
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Wpisz odpowiedź..."
              disabled={!!feedback}
              className="w-full p-4 text-lg bg-[#1a1b2e] border-2 border-[#4255ff] rounded-xl text-white placeholder-[#a8b3cf] focus:outline-none focus:border-[#5567ff] focus:ring-2 focus:ring-[#4255ff]/20 transition-all duration-300 disabled:opacity-50"
            />
            <button
              onClick={() => checkAnswer(currentAnswer)}
              disabled={!currentAnswer || !!feedback}
              className="w-full p-4 bg-[#4255ff] text-white text-lg font-medium rounded-xl hover:bg-[#3244cc] transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4255ff]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              Sprawdź
            </button>
          </div>
        )}

        {questionType === QUESTION_TYPES.MULTIPLE_CHOICE && (
          <div className="mt-auto grid grid-cols-2 gap-4">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => checkAnswer(option)}
                disabled={!!feedback}
                className={`p-4 text-lg font-medium rounded-xl transition-all duration-300 ${
                  feedback
                    ? option === currentCard.answer
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "bg-[#4255ff] hover:bg-[#3244cc] transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4255ff]/20"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {questionType === QUESTION_TYPES.TRUE_FALSE && (
          <div className="mt-auto flex flex-col items-center gap-6">
            <p className="text-2xl text-center">{currentCard.answer}</p>
            <div className="flex gap-4 w-full max-w-lg">
              <button
                onClick={() => checkAnswer(currentCard.answer)}
                disabled={!!feedback}
                className="flex-1 p-4 bg-[#4255ff] text-white text-lg font-medium rounded-xl hover:bg-[#3244cc] transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4255ff]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Prawda
              </button>
              <button
                onClick={() => checkAnswer("wrong")}
                disabled={!!feedback}
                className="flex-1 p-4 bg-[#4255ff] text-white text-lg font-medium rounded-xl hover:bg-[#3244cc] transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4255ff]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Fałsz
              </button>
            </div>
          </div>
        )}

        {feedback && (
          <div
            className={`absolute bottom-0 left-0 right-0 p-6 text-center text-lg font-medium rounded-b-xl animate-slideUp ${
              feedback.isCorrect
                ? "bg-green-500/90 backdrop-blur"
                : "bg-red-500/90 backdrop-blur"
            }`}
          >
            {feedback.isCorrect ? (
              <p>Poprawnie! 🎉</p>
            ) : (
              <div>
                <p>Niepoprawnie 😕</p>
                <p>Prawidłowa odpowiedź: {feedback.correctAnswer}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Learn;
