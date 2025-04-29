import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaVolumeUp,
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
  FaShareAlt,
  FaEllipsisH,
} from "react-icons/fa";
import axios from "axios";
import "./Sets.css";
import Modal from "../../molecules/Modal";
import PropTypes from "prop-types";

const Sets = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setInfo, setSetInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progress, setProgress] = useState({});

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
        setCards(response.data.cards);
        setSetInfo(response.data);

        // Pobierz zapisany postęp dla zestawu
        try {
          const progressResponse = await axios.get(
            `http://localhost:3001/sets/${numericSetId}/progress`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setProgress(progressResponse.data.progress || {});
        } catch (progressError) {
          console.error("Error fetching progress:", progressError);
          setProgress({});
        }

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

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      setCurrentCardIndex(0);
      setIsModalOpen(true);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    } else {
      setCurrentCardIndex(cards.length - 1);
      setIsFlipped(false);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Nie jesteś zalogowany");
        return;
      }

      const numericSetId = parseInt(setId);
      if (isNaN(numericSetId)) {
        setError("Nieprawidłowe ID zestawu");
        return;
      }

      const response = await axios.post(
        "http://localhost:3001/quizzes",
        {
          title: `${setInfo.title} - Quiz`,
          description: `Quiz utworzony z zestawu "${setInfo.title}"`,
          timeLimit: 300,
          maxAttempts: 3,
          passingScore: 70,
          isPublic: true,
          setId: numericSetId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/quiz/${response.data.id}`);
    } catch (error) {
      console.error("Error creating quiz:", error);
      setError(error.response?.data?.error || "Nie udało się utworzyć quizu");
    }
  };

  const handleToggleTracking = async () => {
    const newTrackingState = !isTracking;
    setIsTracking(newTrackingState);

    if (newTrackingState) {
      // Inicjalizuj postęp dla wszystkich kart, jeśli nie istnieje
      const initialProgress = { ...progress };
      cards.forEach((card) => {
        if (!initialProgress[card.id]) {
          initialProgress[card.id] = {
            mastery: 0,
            attempts: 0,
            correct: 0,
          };
        }
      });
      setProgress(initialProgress);
    }
  };

  const handleMemoryResponse = async (remembered) => {
    if (!isTracking) return;

    const currentCard = cards[currentCardIndex];
    const cardProgress = progress[currentCard.id] || {
      mastery: 0,
      attempts: 0,
      correct: 0,
    };

    const newProgress = {
      ...progress,
      [currentCard.id]: {
        ...cardProgress,
        attempts: cardProgress.attempts + 1,
        correct: cardProgress.correct + (remembered ? 1 : 0),
        mastery:
          (cardProgress.correct + (remembered ? 1 : 0)) /
          (cardProgress.attempts + 1),
      },
    };

    setProgress(newProgress);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:3001/sets/${setId}/progress`,
        {
          cardId: currentCard.id,
          remembered,
          progress: newProgress[currentCard.id],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Error updating progress:", error);
    }

    // Przejdź do następnej karty
    handleNextCard();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        handleNextCard();
      }
      if (event.key === "ArrowLeft") {
        handlePreviousCard();
      }
      if (event.key === " ") {
        handleCardClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentCardIndex, cards.length]);

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
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-[#4255ff] text-white rounded-full hover:bg-[#423ed8] transition-all duration-300"
        >
          Wróć do strony głównej
        </button>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#0a092d] text-white">
        <div className="text-xl mb-4">Ten zestaw nie ma żadnych kart</div>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-[#4255ff] text-white rounded-full hover:bg-[#423ed8] transition-all duration-300"
        >
          Wróć do strony głównej
        </button>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const currentProgress = progress[currentCard.id] || {
    mastery: 0,
    attempts: 0,
    correct: 0,
  };
  const masteryPercentage =
    currentProgress.attempts > 0
      ? Math.round((currentProgress.correct / currentProgress.attempts) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#0a092d] text-white p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{setInfo?.title}</h1>
          <div className="flex gap-4">
            <button className="icon-button">
              <FaSearch />
            </button>
            <button className="icon-button">
              <FaShareAlt />
            </button>
            <button className="icon-button">
              <FaEllipsisH />
            </button>
          </div>
        </div>
      </div>

      {/* Learning modes */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid grid-cols-4 gap-4">
          <button className="mode-card active">
            <span className="mode-icon">🎴</span>
            <span>Fiszki</span>
          </button>
          <button
            className="mode-card"
            onClick={() => navigate(`/sets/${setId}/learn`)}
          >
            <span className="mode-icon">📚</span>
            <span>Ucz się</span>
          </button>
          <button
            className="mode-card"
            onClick={() => navigate(`/sets/${setId}/test-config`)}
          >
            <span className="mode-icon">✍️</span>
            <span>Test</span>
          </button>
          <button className="mode-card">
            <span className="mode-icon">🎮</span>
            <span>Klocki</span>
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-4xl mx-auto">
        <div className="flip-card" onClick={handleCardClick}>
          <div className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}>
            <div className="flip-card-front">
              <p className="text-2xl">{cards[currentCardIndex]?.question}</p>
              {isTracking && (
                <div className="absolute bottom-4 left-4 text-sm text-[#a8b3cf]">
                  Opanowanie: {masteryPercentage}%
                </div>
              )}
            </div>
            <div className="flip-card-back">
              <p className="text-2xl">{cards[currentCardIndex]?.answer}</p>
              {isTracking && (
                <div className="absolute bottom-4 left-4 text-sm text-[#a8b3cf]">
                  Próby: {currentProgress.attempts}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex items-center gap-4">
            <button
              className="nav-button"
              onClick={handlePreviousCard}
              disabled={currentCardIndex === 0}
            >
              <FaArrowLeft />
            </button>
            <span>
              {currentCardIndex + 1} / {cards.length}
            </span>
            <button
              className="nav-button"
              onClick={handleNextCard}
              disabled={currentCardIndex === cards.length - 1}
            >
              <FaArrowRight />
            </button>
          </div>
          <button className="icon-button">
            <FaVolumeUp />
          </button>
        </div>

        {/* Progress tracking */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex items-center gap-2">
            <div
              className={`toggle-switch ${isTracking ? "active" : ""}`}
              onClick={handleToggleTracking}
            >
              <div className="toggle-switch-handle" />
            </div>
            <span>Śledź postęp</span>
          </div>
          <div className="flex gap-4">
            <button
              className="memory-button wrong"
              onClick={() => handleMemoryResponse(false)}
              disabled={!isTracking}
            >
              Nie pamiętam
            </button>
            <button
              className="memory-button correct"
              onClick={() => handleMemoryResponse(true)}
              disabled={!isTracking}
            >
              Pamiętam
            </button>
          </div>
        </div>
      </div>

      {/* <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 bg-[#2e3856] rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-4">
            Gratulacje, ukończyłeś zestaw!
          </h2>
          <button
            onClick={handleCreateQuiz}
            className="px-6 py-3 bg-[#4255ff] text-white rounded-full hover:bg-[#423ed8] transition-all duration-300"
          >
            Rozpocznij quiz
          </button>
        </div>
      </Modal> */}
    </div>
  );
};

Sets.propTypes = {
  title: PropTypes.string.isRequired,
};

export default Sets;
