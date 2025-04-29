import { useState, useEffect } from "react";
import axios from "axios";
import "./UserStats.css";

const UserStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3001/user/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError("Nie udało się załadować statystyk");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a092d] text-white p-8">
        <div className="text-xl">Ładowanie...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a092d] text-white p-8">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  // Oblicz aktualny miesiąc i rok
  const currentDate = new Date();
  const monthNames = [
    "styczeń",
    "luty",
    "marzec",
    "kwiecień",
    "maj",
    "czerwiec",
    "lipiec",
    "sierpień",
    "wrzesień",
    "październik",
    "listopad",
    "grudzień",
  ];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Przygotuj dane do kalendarza
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  const calendar = [];
  const weekDays = ["n", "p", "w", "ś", "c", "p", "s"];

  // Wypełnij tablicę dni
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendar.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendar.push(i);
  }

  return (
    <div className="min-h-screen bg-[#0a092d] text-white p-8">
      <h1 className="text-4xl font-bold mb-12">Osiągnięcia</h1>

      {/* Ostatnia aktywność */}
      <div className="bg-[#2e3856] rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">Ostatnia aktywność</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Przyznane ostatnio */}
          <div>
            <h3 className="text-xl mb-4">Ostatnie osiągnięcia</h3>
            <div className="space-y-4">
              {/* Najlepszy wynik z quizu */}
              <div className="achievement-badge">
                <div className="achievement-icon">
                  <div className="achievement-border">
                    <div className="achievement-inner">
                      <span className="achievement-number">
                        {stats.bestQuizScore || 0}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="achievement-info">
                  <p className="achievement-title">Najlepszy wynik</p>
                  <p className="achievement-desc">
                    Twój najlepszy wynik z quizu to {stats.bestQuizScore || 0}%
                  </p>
                </div>
              </div>

              {/* Najdłuższa seria */}
              <div className="achievement-badge">
                <div className="achievement-icon">
                  <div className="achievement-border">
                    <div className="achievement-inner">
                      <span className="achievement-number">
                        {stats.longestStreak || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="achievement-info">
                  <p className="achievement-title">Najdłuższa seria</p>
                  <p className="achievement-desc">
                    Twoja najdłuższa seria poprawnych odpowiedzi to{" "}
                    {stats.longestStreak || 0}
                  </p>
                </div>
              </div>

              {/* Quizy dzisiaj */}
              <div className="achievement-badge">
                <div className="achievement-icon">
                  <div className="achievement-border">
                    <div className="achievement-inner">
                      <span className="achievement-number">
                        {stats.todayQuizzes || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="achievement-info">
                  <p className="achievement-title">Aktywność dziś</p>
                  <p className="achievement-desc">
                    Ukończyłeś {stats.todayQuizzes || 0} quizów dzisiaj
                  </p>
                </div>
              </div>

              {/* Całkowity czas nauki */}
              <div className="achievement-badge">
                <div className="achievement-icon">
                  <div className="achievement-border">
                    <div className="achievement-inner">
                      <span className="achievement-number">
                        {Math.floor((stats.totalStudyTime || 0) / 60)}h
                      </span>
                    </div>
                  </div>
                </div>
                <div className="achievement-info">
                  <p className="achievement-title">Czas nauki</p>
                  <p className="achievement-desc">
                    Spędziłeś {Math.floor((stats.totalStudyTime || 0) / 60)}{" "}
                    godzin i {(stats.totalStudyTime || 0) % 60} minut na nauce
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kalendarz */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl">
                {currentMonth} {currentYear}
              </h3>
              <div className="flex gap-2">
                <button className="p-2 bg-[#1a1d28] rounded-lg">&lt;</button>
                <button className="p-2 bg-[#1a1d28] rounded-lg">&gt;</button>
              </div>
            </div>
            <div className="calendar-grid">
              {/* Dni tygodnia */}
              <div className="calendar-header">
                {weekDays.map((day, index) => (
                  <div key={index} className="calendar-day-name">
                    {day}
                  </div>
                ))}
              </div>
              {/* Dni miesiąca */}
              <div className="calendar-days">
                {calendar.map((day, index) => (
                  <div
                    key={index}
                    className={`calendar-day ${!day ? "empty" : ""} ${
                      day === currentDate.getDate() ? "current" : ""
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statystyki */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Zestawy</h3>
          <div className="stat-value text-blue-400">{stats.totalSets || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Quizy</h3>
          <div className="stat-value text-purple-400">
            {stats.totalQuizzes || 0}
          </div>
        </div>
        <div className="stat-card">
          <h3>Karty</h3>
          <div className="stat-value text-green-400">
            {stats.totalCards || 0}
          </div>
        </div>
        <div className="stat-card">
          <h3>Skuteczność</h3>
          <div className="stat-value text-yellow-400">
            {stats.correctAnswers + stats.incorrectAnswers > 0
              ? Math.round(
                  (stats.correctAnswers /
                    (stats.correctAnswers + stats.incorrectAnswers)) *
                    100
                )
              : 0}
            %
          </div>
          <div className="stat-details text-sm">
            <div>Poprawne: {stats.correctAnswers || 0}</div>
            <div>Niepoprawne: {stats.incorrectAnswers || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
