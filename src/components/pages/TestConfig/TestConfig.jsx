import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import axios from "axios";
import "./TestConfig.css";

const TestConfig = () => {
  const { setId } = useParams();
  const navigate = useNavigate();
  const [maxQuestions, setMaxQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    questionCount: 20,
    answerType: "both", // "both", "question", "answer"
    types: {
      trueFalse: false,
      multipleChoice: true,
      matching: false,
      written: false,
    },
  });

  useEffect(() => {
    const fetchSet = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/sets/${setId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const cardsCount = response.data.cards.length;
        setMaxQuestions(cardsCount);
        setConfig((prev) => ({
          ...prev,
          questionCount: Math.min(prev.questionCount, cardsCount),
        }));
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

  const handleQuestionCountChange = (value) => {
    const count = Math.min(Math.max(1, value), maxQuestions);
    setConfig({ ...config, questionCount: count });
  };

  const handleAnswerTypeChange = (type) => {
    setConfig({ ...config, answerType: type });
  };

  const handleTypeToggle = (type) => {
    setConfig({
      ...config,
      types: {
        ...config.types,
        [type]: !config.types[type],
      },
    });
  };

  const handleStartTest = () => {
    // Sprawdź, czy wybrano przynajmniej jeden typ pytania
    if (!Object.values(config.types).some((value) => value)) {
      alert("Wybierz przynajmniej jeden typ pytania");
      return;
    }

    // Przekieruj do testu z konfiguracją
    navigate(`/sets/${setId}/test`, { state: { config } });
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

  return (
    <div className="min-h-screen bg-[#0a092d] text-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#2e3856] rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Skonfiguruj swój test</h2>
            <button
              onClick={() => navigate(`/sets/${setId}`)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Liczba pytań */}
          <div className="mb-6">
            <label className="block text-lg mb-2">
              Pytania (maksymalnie {maxQuestions})
            </label>
            <input
              type="number"
              min="1"
              max={maxQuestions}
              value={config.questionCount}
              onChange={(e) =>
                handleQuestionCountChange(parseInt(e.target.value))
              }
              className="w-20 px-3 py-2 bg-[#1a1d28] rounded-lg text-center"
            />
          </div>

          {/* Typ odpowiedzi */}
          <div className="mb-6">
            <label className="block text-lg mb-2">Odpowiedź</label>
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 rounded-lg ${
                  config.answerType === "both"
                    ? "bg-[#4255ff] text-white"
                    : "bg-[#1a1d28] text-gray-400"
                }`}
                onClick={() => handleAnswerTypeChange("both")}
              >
                Oba
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  config.answerType === "question"
                    ? "bg-[#4255ff] text-white"
                    : "bg-[#1a1d28] text-gray-400"
                }`}
                onClick={() => handleAnswerTypeChange("question")}
              >
                Pytanie
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  config.answerType === "answer"
                    ? "bg-[#4255ff] text-white"
                    : "bg-[#1a1d28] text-gray-400"
                }`}
                onClick={() => handleAnswerTypeChange("answer")}
              >
                Odpowiedź
              </button>
            </div>
          </div>

          {/* Typy pytań */}
          <div className="mb-6">
            <label className="block text-lg mb-2">Typy pytań</label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 rounded-lg cursor-pointer ${
                  config.types.trueFalse
                    ? "bg-[#4255ff] text-white"
                    : "bg-[#1a1d28] text-gray-400"
                }`}
                onClick={() => handleTypeToggle("trueFalse")}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.types.trueFalse}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  <span>Prawda/Fałsz</span>
                </div>
              </div>
              <div
                className={`p-4 rounded-lg cursor-pointer ${
                  config.types.multipleChoice
                    ? "bg-[#4255ff] text-white"
                    : "bg-[#1a1d28] text-gray-400"
                }`}
                onClick={() => handleTypeToggle("multipleChoice")}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.types.multipleChoice}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  <span>Pytania wielokrotnego wyboru</span>
                </div>
              </div>
              <div
                className={`p-4 rounded-lg cursor-pointer ${
                  config.types.matching
                    ? "bg-[#4255ff] text-white"
                    : "bg-[#1a1d28] text-gray-400"
                }`}
                onClick={() => handleTypeToggle("matching")}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.types.matching}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  <span>Dopasuj pytania do odpowiedzi</span>
                </div>
              </div>
              <div
                className={`p-4 rounded-lg cursor-pointer ${
                  config.types.written
                    ? "bg-[#4255ff] text-white"
                    : "bg-[#1a1d28] text-gray-400"
                }`}
                onClick={() => handleTypeToggle("written")}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.types.written}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                  <span>Pytania pisemne</span>
                </div>
              </div>
            </div>
          </div>

          {/* Przycisk rozpoczęcia */}
          <button
            onClick={handleStartTest}
            className="w-full py-3 bg-[#4255ff] text-white rounded-lg hover:bg-[#2b3bcc] transition-colors"
          >
            Rozpocznij test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestConfig;
