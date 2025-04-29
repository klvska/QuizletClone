import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./Results.css";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setId } = useParams();
  const [setInfo, setSetInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { stats, progress } = location.state || {
    stats: { correct: 0, incorrect: 0, streak: 0 },
    progress: {},
  };

  useEffect(() => {
    const fetchSetInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/sets/${setId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSetInfo(response.data);

        // Zapisz wyniki
        await axios.post(
          `http://localhost:3001/results/${setId}/save`,
          {
            streak: stats.streak,
            timeSpent: location.state?.timeSpent || 0,
            correctAnswers: stats.correct,
            incorrectAnswers: stats.incorrect,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Znajdź quiz dla tego zestawu
        const quizResponse = await axios.get(
          `http://localhost:3001/quizzes?setId=${setId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (quizResponse.data && quizResponse.data.length > 0) {
          const quiz = quizResponse.data[0];

          // Wyślij wyniki quizu
          await axios.post(
            `http://localhost:3001/quizzes/${quiz.id}/attempt`,
            {
              answers: JSON.stringify(progress),
              timeSpent: 0, // TODO: dodać śledzenie czasu
              score:
                Math.round(
                  (stats.correct / (stats.correct + stats.incorrect)) * 100
                ) || 0,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }

        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        setError("Wystąpił błąd podczas zapisywania wyników");
        setLoading(false);
      }
    };

    fetchSetInfo();
  }, [setId, stats, progress, location.state?.timeSpent]);

  if (loading) {
    return <div className="results-loading">Ładowanie...</div>;
  }

  if (error) {
    return (
      <div className="results-error">
        <p>{error}</p>
        <button onClick={() => navigate(`/sets/${setId}`)}>
          Wróć do zestawu
        </button>
      </div>
    );
  }

  const totalCards = setInfo?.cards?.length || 0;
  const totalAnswers = stats.correct + stats.incorrect;
  const accuracy =
    totalAnswers > 0 ? Math.round((stats.correct / totalAnswers) * 100) : 0;

  // Obliczanie poziomów opanowania na podstawie całkowitej liczby kart
  const masteryLevels = {
    mastered: 0,
    learning: 0,
    needsPractice: 0,
  };

  if (setInfo?.cards) {
    setInfo.cards.forEach((card) => {
      const cardProgress = progress[card.id] || { correct: 0, attempts: 0 };
      const mastery =
        cardProgress.attempts > 0
          ? cardProgress.correct / cardProgress.attempts
          : 0;

      if (mastery >= 0.8) {
        masteryLevels.mastered++;
      } else if (mastery >= 0.5) {
        masteryLevels.learning++;
      } else {
        masteryLevels.needsPractice++;
      }
    });
  }

  return (
    <div className="results-container">
      <div className="results-header">
        <h1>Podsumowanie nauki</h1>
        <h2>{setInfo?.title}</h2>
      </div>

      <div className="results-content">
        <div className="results-stats">
          <div className="stat-card">
            <h3>Dokładność</h3>
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-details">
              <span>Poprawne: {stats.correct}</span>
              <span>Niepoprawne: {stats.incorrect}</span>
            </div>
          </div>

          <div className="stat-card">
            <h3>Najdłuższa seria</h3>
            <div className="stat-value">{stats.streak}</div>
            <div className="stat-details">
              <span>poprawnych odpowiedzi</span>
            </div>
          </div>

          <div className="stat-card">
            <h3>Postęp</h3>
            <div className="mastery-bars">
              <div className="mastery-bar">
                <div className="bar-label">Opanowane</div>
                <div className="bar-container">
                  <div
                    className="bar-fill mastered"
                    style={{
                      width: `${(masteryLevels.mastered / totalCards) * 100}%`,
                    }}
                  />
                </div>
                <div className="bar-value">{masteryLevels.mastered}</div>
              </div>

              <div className="mastery-bar">
                <div className="bar-label">W trakcie nauki</div>
                <div className="bar-container">
                  <div
                    className="bar-fill learning"
                    style={{
                      width: `${(masteryLevels.learning / totalCards) * 100}%`,
                    }}
                  />
                </div>
                <div className="bar-value">{masteryLevels.learning}</div>
              </div>

              <div className="mastery-bar">
                <div className="bar-label">Wymaga ćwiczeń</div>
                <div className="bar-container">
                  <div
                    className="bar-fill needs-practice"
                    style={{
                      width: `${
                        (masteryLevels.needsPractice / totalCards) * 100
                      }%`,
                    }}
                  />
                </div>
                <div className="bar-value">{masteryLevels.needsPractice}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button
            className="action-button retry"
            onClick={() => navigate(`/sets/${setId}/learn`)}
          >
            Spróbuj ponownie
          </button>
          <button
            className="action-button back"
            onClick={() => navigate(`/sets/${setId}`)}
          >
            Wróć do zestawu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
