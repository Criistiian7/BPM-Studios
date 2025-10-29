import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Login from "../components/auth/login";
import Register from "../components/auth/register";

// Interfața pentru proprietățile componentei AuthPage
interface AuthPageProps {
  mode?: "login" | "register";  // Modul implicit al paginii
}

const AuthPage: React.FC<AuthPageProps> = ({ mode: initialMode = "login" }) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const navigate = useNavigate();
  const location = useLocation();

  // Actualizează modul când se schimbă ruta
  useEffect(() => {
    if (location.pathname === "/login") {
      setMode("login");
    } else if (location.pathname === "/register") {
      setMode("register");
    }
  }, [location.pathname]);

  /**
   * Navighează către pagina de login
   */
  const navigateToLogin = () => {
    navigate("/login");
  };

  /**
   * Navighează către pagina de register
   */
  const navigateToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 dark:from-purple-900 dark:via-pink-800 dark:to-indigo-900 p-4 sm:p-6 transition-colors relative overflow-hidden">
      {/* Decorative Elements - Responsive sizing */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-36 h-36 sm:w-72 sm:h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-2xl sm:blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute top-20 sm:top-40 right-10 sm:right-20 w-36 h-36 sm:w-72 sm:h-72 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-2xl sm:blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-4 sm:-bottom-8 left-20 sm:left-40 w-36 h-36 sm:w-72 sm:h-72 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-2xl sm:blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Side - Text Content - Ascuns pe mobile */}
        <div className="hidden lg:flex flex-col items-start p-6 lg:p-8 space-y-4 lg:space-y-6">
          {/* Logo - Responsive sizing, clickable pentru a naviga către Home */}
          <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
            <img src="/logo.svg" alt="BeatPlanner Logo" className="w-8 h-8 lg:w-12 lg:h-12" />
            <Link to="/home" className="text-2xl lg:text-4xl font-extrabold text-white drop-shadow-2xl hover:opacity-80 transition-opacity cursor-pointer">
              BeatPlanner
            </Link>
          </div>

          {/* Main Heading - Responsive text */}
          <div className="space-y-2 lg:space-y-3">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
              Platforma ta de
              <br />
              <span className="text-yellow-300">colaborare muzicală</span>
            </h2>
          </div>

          {/* Description - Responsive text */}
          <p className="text-base lg:text-xl text-white/90 leading-relaxed drop-shadow-md">
            Conectează-te cu artiști și producători din întreaga lume,
            împărtășește track-uri și construiește-ți rețeaua profesională.
          </p>

          {/* Features List - Responsive sizing */}
          <div className="space-y-3 lg:space-y-4 mt-4 lg:mt-6">
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-lg lg:text-2xl">🎵</span>
              </div>
              <span className="text-white text-sm lg:text-lg font-medium drop-shadow-md">
                Upload și organizare piese audio
              </span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-lg lg:text-2xl">🤝</span>
              </div>
              <span className="text-white text-sm lg:text-lg font-medium drop-shadow-md">
                Colaborează cu artiști și producători talentați
              </span>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-lg lg:text-2xl">🎙️</span>
              </div>
              <span className="text-white text-sm lg:text-lg font-medium drop-shadow-md">
                Player audio integrat și management
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="flex items-center justify-center">
          {mode === "login" ? (
            <Login onSwitchToRegister={navigateToRegister} />
          ) : (
            <Register onSwitchToLogin={navigateToLogin} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
