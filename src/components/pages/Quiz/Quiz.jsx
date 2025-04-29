import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Quiz.css";

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/quizzes/${quizId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setQuiz(response.data);
        if (response.data.timeLimit) {
          setTimeLeft(response.data.timeLimit);
        }
        setStartTime(Date.now());
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < quiz.cards.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const correctAnswers = answers.filter(
      (answer, index) => answer === quiz.cards[index].answer
    ).length;
    const finalScore = Math.round((correctAnswers / quiz.cards.length) * 100);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/quizzes/${quizId}/attempt`,
        {
          answers,
          timeSpent,
          score: finalScore,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setScore(finalScore);
      setIsFinished(true);
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
    }
  };

  if (!quiz) return <div>Ładowanie...</div>;

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Quiz zakończony!</h2>
          <p className="text-xl mb-4">Twój wynik: {score}%</p>
          <p className="mb-4">
            Czas: {Math.floor((Date.now() - startTime) / 1000)} sekund
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Wróć do strony głównej
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        {timeLeft !== null && (
          <div className="mb-4 text-right">
            <span className="text-lg font-bold">
              Pozostały czas: {timeLeft}s
            </span>
          </div>
        )}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
          <p className="text-gray-600">{quiz.description}</p>
        </div>
        <div className="mb-4">
          <p className="text-lg font-semibold">
            Pytanie {currentQuestion + 1} z {quiz.cards.length}
          </p>
        </div>
        <div className="mb-6">
          <p className="text-xl mb-4">{quiz.cards[currentQuestion].question}</p>
          {quiz.cards[currentQuestion].hint && (
            <p className="text-gray-500 mb-4">
              Podpowiedź: {quiz.cards[currentQuestion].hint}
            </p>
          )}
          <input
            type="text"
            value={answers[currentQuestion] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Wpisz odpowiedź"
          />
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Poprzednie
          </button>
          <button
            onClick={() =>
              setCurrentQuestion((prev) =>
                Math.min(quiz.cards.length - 1, prev + 1)
              )
            }
            disabled={currentQuestion === quiz.cards.length - 1}
            className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Następne
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
