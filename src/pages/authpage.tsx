import React, { useState } from "react";
import Login from "../components/auth/login";
import Register from "../components/auth/register";

const AuthPage: React.FC = () => {
    const  [mode, setMode] = useState<"login" | "register">("login");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            {mode === "login" ? (
                <Login onSwitchToRegister={() => setMode("register")} />
            ) : (
                <Register onSwitchToLogin={() => setMode("login")} />
            )}
            </div>
            );
        };
        
        export default AuthPage;