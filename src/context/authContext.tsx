import React, { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import type { AppUser, AccountType } from "../types/user";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  register: (
    email: string,
    password: string,
    name?: string,
    accountType?: AccountType
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        try {
          const userRef = doc(db, "users", fbUser.uid);
          const snap = await getDoc(userRef);
          const profile = snap.exists() ? snap.data() : null;
          const accountType = (profile?.accountType ?? "artist") as AccountType;
          const rating = typeof profile?.rating === "number" ? profile!.rating : 0;
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName ?? fbUser.email ?? "User",
            email: fbUser.email ?? "",
            avatar: fbUser.photoURL ?? null,
            accountType,
            rating,
          });
        } catch (err) {
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName ?? fbUser.email ?? "User",
            email: fbUser.email ?? "",
            avatar: fbUser.photoURL ?? null,
            accountType: "artist",
            rating: 0,
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const register = async (
    email: string,
    password: string,
    name?: string,
    accountType: AccountType = "artist"
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user) {
      if (name) {
        await updateProfile(cred.user, { displayName: name }).catch(() => {});
      }
      // Create a basic profile document in Firestore
      const userRef = doc(db, "users", cred.user.uid);
      await setDoc(userRef, {
        uid: cred.user.uid,
        email: cred.user.email ?? email,
        displayName: name ?? cred.user.displayName ?? "",
        photoURL: cred.user.photoURL ?? null,
        accountType,
        rating: 0,
        description: "",
        statistics: { tracksUploaded: 0, projectsCompleted: 0 },
        socialLinks: { facebook: null, instagram: null, youtube: null },
        location: "",
        phoneNumber: cred.user.phoneNumber ?? null,
        memberSince: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    navigate("/dashboard");
  };

  const loginDemo = async () => {
    const demoEmail = import.meta.env.VITE_DEMO_EMAIL;
    const demoPass = import.meta.env.VITE_DEMO_PASSWORD;
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
