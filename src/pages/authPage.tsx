import React, { useState } from "react";
import Login from "../components/auth/login";
import Register from "../components/auth/register";

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");

  return (
    <div
      className="min-h-screen flex items-center justify-center 
        bg-gradient-to-br from-gray-50 to-gray-100 p-6"
    >
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-start p-8">
          <h1 className="text-4xl font-extrabold mb-4">Beat Planner</h1>
          <p className="text-gray-600">
            Conectează-te cu artiști, împărtășește track-uri și construiește
            rețeaua ta.
          </p>
        </div>

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
