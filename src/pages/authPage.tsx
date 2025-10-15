import React, { useState } from "react";
import Login from "../components/auth/login";
import Register from "../components/auth/register";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 dark:from-purple-900 dark:via-pink-800 dark:to-indigo-900 p-6 transition-colors relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-400 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Text Content */}
        <div className="hidden md:flex flex-col items-start p-8 space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.svg" alt="BeatPlanner Logo" className="w-12 h-12" />
            <h1 className="text-4xl font-extrabold text-white drop-shadow-2xl">
              BeatPlanner
            </h1>
          </div>

          {/* Main Heading */}
          <div className="space-y-3">
            <h2 className="text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
              Platforma ta de
              <br />
              <span className="text-yellow-300">colaborare muzicală</span>
            </h2>
          </div>

          {/* Description */}
          <p className="text-xl text-white/90 leading-relaxed drop-shadow-md">
            Conectează-te cu artiști și producători din întreaga lume,
            împărtășește track-uri și construiește-ți rețeaua profesională.
          </p>

          {/* Features List */}
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
              <span className="text-white text-lg font-medium drop-shadow-md">
                Upload și organizare piese audio
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <span className="text-white text-lg font-medium drop-shadow-md">
                Colaborează cu artiști și producători talentați
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-2xl">🎙️</span>
              </div>
              <span className="text-white text-lg font-medium drop-shadow-md">
                Player audio integrat și management
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="flex items-center justify-center">
          {mode === "login" ? (
            <Login onSwitchToRegister={() => setMode("register")} />
          ) : (
            <Register onSwitchToLogin={() => setMode("login")} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
