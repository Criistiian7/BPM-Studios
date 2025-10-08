import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = { id: string; name: string; email: string; avatar?: string } | null;

type AuthContextType = {
    user: User;
    login: (user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(null);
    const navigate = useNavigate();

    const login = (u: User) => {
        setUser(u);
        localStorage.setItem("bpm_user", JSON.stringify(u));
        navigate("/dashboard");
    };
    
    const logout = () => {
        setUser(null);
        localStorage.removeItem("bpm_user");
        navigate("/auth");
    };

    React.useEffect(() => {
        const raw = localStorage.getItem("bpm_user");
        if (raw) {
            try {
                setUser(JSON.parse(raw));
            } catch {}
        }
    }, []);
    
    return <AuthContext.Provider value={{ user, login, logout }}>{children}
    </AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};