import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

type User = { id: string; name: string; email: string; avatar?: string } | null;

type AuthContextType = {
    user: User;
    login: (user: User) => void;
    logout: () => void;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const raw = localStorage.getItem("bpm_user");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                setUser(parsed);
            } catch (err) {
                console.error("Failed to parse user from storage", err);
                localStorage.removeItem("bpm_user");
            }
        }
        setLoading(false);
    }, []);

    const login = (u: User) => {
        setUser(u);
        try {
        if (u) localStorage.setItem("bpm_user", JSON.stringify(u));
        else localStorage.removeItem("bpm_user");
        navigate("/dashboard");
    } catch (err){
        console.error("Login error:", err);
    }
    };
    
    const logout = () => {
        setUser(null);
        localStorage.removeItem("bpm_user");
        navigate("/auth");
    };

    
    return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}
    </AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};