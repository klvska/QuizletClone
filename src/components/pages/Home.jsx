import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SetCard from "../organisms/SetCard";

const Home = () => {
  const [sets, setSets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [setsResponse, statsResponse] = await Promise.all([
        axios.get("http://localhost:3001/sets", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3001/user/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSets(setsResponse.data);
      setStats(statsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Nie udało się załadować danych");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="text-center p-8">Ładowanie...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a092d] to-[#1a1b3d]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {stats && (
          <div className="bg-[#282e3e]/80 backdrop-blur-lg rounded-2xl p-8 mb-12 transform hover:scale-[1.02] transition-all duration-300 shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-8 border-b border-[#4255ff]/30 pb-4">
              Twoje statystyki
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#2e3856] rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#4255ff]/20">
                <p className="text-[#939bb4] text-sm uppercase tracking-wider mb-2">
                  Zestawy
                </p>
                <p className="text-white text-4xl font-bold">
                  {stats.totalSets}
                </p>
              </div>
              <div className="bg-[#2e3856] rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#4255ff]/20">
                <p className="text-[#939bb4] text-sm uppercase tracking-wider mb-2">
                  Quizy
                </p>
                <p className="text-white text-4xl font-bold">
                  {stats.totalQuizzes}
                </p>
              </div>
              <div className="bg-[#2e3856] rounded-xl p-6 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#4255ff]/20">
                <p className="text-[#939bb4] text-sm uppercase tracking-wider mb-2">
                  Karty
                </p>
                <p className="text-white text-4xl font-bold">
                  {stats.totalCards}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-8 border-b border-[#4255ff]/30 pb-4">
            Dostępne zestawy
          </h2>
          {sets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sets.map((set) => (
                <Link
                  key={set.id}
                  to={`/sets/${set.id}`}
                  className="block transform hover:scale-[1.03] transition-all duration-300"
                >
                  <SetCard
                    title={set.title}
                    userEmail={set.user.email}
                    userName={set.user.name}
                    cardCount={set.cards.length}
                    description={set.description}
                    isPublic={set.isPublic}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#282e3e]/80 backdrop-blur-lg rounded-2xl">
              <p className="text-[#939bb4] text-xl mb-6">
                Brak dostępnych zestawów
              </p>
              <Link
                to="/add-set"
                className="inline-block px-8 py-4 bg-gradient-to-r from-[#4255ff] to-[#423ed8] text-white rounded-full hover:from-[#423ed8] hover:to-[#4255ff] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[#4255ff]/20"
              >
                Utwórz pierwszy zestaw
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
