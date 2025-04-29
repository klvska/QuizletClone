import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-[#0a092d]/80 backdrop-blur-lg text-white border-b border-[#4255ff]/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center group">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4255ff] to-[#423ed8] bg-clip-text text-transparent group-hover:from-[#423ed8] group-hover:to-[#4255ff] transition-all duration-300">
                Quizlet Clone
              </h1>
            </Link>
            {userEmail && (
              <nav className="hidden md:flex items-center space-x-4">
                <Link
                  to="/add-set"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#4255ff] to-[#423ed8] hover:from-[#423ed8] hover:to-[#4255ff] transition-all duration-300 shadow-lg hover:shadow-[#4255ff]/20 transform hover:scale-105"
                >
                  Utwórz zestaw
                </Link>
                <Link
                  to="/stats"
                  className="px-4 py-2 rounded-full hover:bg-[#282e3e] transition-all duration-300 border border-[#4255ff]/10 hover:border-[#4255ff]/30"
                >
                  Statystyki
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-6">
            {userEmail ? (
              <>
                <span className="text-[#939bb4]">
                  Witaj,{" "}
                  <span className="text-white font-medium">{userEmail}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full bg-red-500/80 hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-red-500/20 transform hover:scale-105"
                >
                  Wyloguj
                </button>
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full hover:bg-[#282e3e] transition-all duration-300 border border-[#4255ff]/10 hover:border-[#4255ff]/30"
                >
                  Rejestracja
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-[#4255ff] to-[#423ed8] hover:from-[#423ed8] hover:to-[#4255ff] transition-all duration-300 shadow-lg hover:shadow-[#4255ff]/20 transform hover:scale-105"
                >
                  Logowanie
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
