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
            name: profile?.displayName || fbUser.displayName || "User",
            email: fbUser.email ?? "",
            avatar: profile?.photoURL || fbUser.photoURL || null,
            accountType,
            rating,
            description: profile?.description ?? "",
            genre: profile?.genre ?? "",
            location: profile?.location ?? "",
            phoneNumber: profile?.phoneNumber ?? null,
            socialLinks: profile?.socialLinks ?? { facebook: null, instagram: null, youtube: null },
            statistics: profile?.statistics ?? { tracksUploaded: 0, projectsCompleted: 0 },
            memberSince: profile?.memberSince ?? "",
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
  
  // Așteaptă ca onAuthStateChanged să seteze user-ul
  await new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        unsubscribe();
        resolve();
      }
    });
  });
  
  navigate("/dashboard");
};

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  try {
    await login(email, password);
  } catch (err: any) {
    setError(err.message ?? "Login failed");
  }
};

// În inputs:
<input 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  // ... rest
/>

  const logout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout }}
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
