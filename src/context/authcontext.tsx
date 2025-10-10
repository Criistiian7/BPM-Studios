import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

type AppUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
} | null;

type AuthContextType = {
  user: AppUser;
  loading: boolean;
  register: (email: string, password: string, name?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser: User | null) => {
      if (fbUser) {
        setUser({
          id: fbUser.uid,
          name: fbUser.displayName ?? fbUser.email ?? "User",
          email: fbUser.email ?? "",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const register = async (email: string, password: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name }).catch(() => {});
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/dashboard");
  };

  const loginDemo = async () => {
    const demoEmail = import.meta.VITE_DEMO_EMAIL;
    const demoPass = import.meta.VITE_DEMO_PASSWORD;
    if (demoEmail && demoPass) {
      await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      navigate("/dashboard");
    } else {
      throw new Error("No demo credentials configured");
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, loginDemo }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
