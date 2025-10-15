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
import { useNavigate, useLocation } from "react-router-dom";

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
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialAuthCheck, setInitialAuthCheck] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  }, [user]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (fbUser) {
        // Setează user-ul imediat cu datele de bază din Firebase Auth
        // pentru a reduce loading time
        const basicUser: AppUser = {
          id: fbUser.uid,
          name: fbUser.displayName ?? fbUser.email ?? "User",
          email: fbUser.email ?? "",
          avatar: fbUser.photoURL ?? null,
          accountType: "artist",
          rating: 0,
        };

        setUser(basicUser);
        setLoading(false); // ✅ Setează loading false IMEDIAT

        // Apoi încarcă datele complete din Firestore în background
        try {
          const userRef = doc(db, "users", fbUser.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            const profile = snap.data();
            const accountType = (profile?.accountType ?? "artist") as AccountType;
            const rating = typeof profile?.rating === "number" ? profile.rating : 0;

            // Update user cu datele complete
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
          }

          // Redirectionează la /profile dacă este pe pagina de auth
          if (location.pathname === "/auth") {
            navigate("/profile");
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
          // User-ul de bază este deja setat, deci aplicația funcționează
        }
      } else {
        setUser(null);
        setLoading(false);

        // Doar redirectionează la /home dacă nu este deja pe o pagină publică
        const publicRoutes = ["/home", "/", "/auth", "/community"];
        if (initialAuthCheck && !publicRoutes.includes(location.pathname)) {
          navigate("/home");
        }
      }

      setInitialAuthCheck(false);
    });
    return () => unsub();
  }, [navigate, location.pathname, initialAuthCheck]);

  const register = async (
    email: string,
    password: string,
    name?: string,
    accountType: AccountType = "artist"
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred.user) {
      if (name) {
        await updateProfile(cred.user, { displayName: name }).catch(() => { });
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
  };
  const logout = async () => {
    await signOut(auth);
  };

  const refreshUser = async () => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const profile = snap.data();
        const accountType = (profile?.accountType ?? "artist") as AccountType;
        const rating = typeof profile?.rating === "number" ? profile!.rating : 0;

        setUser({
          id: auth.currentUser.uid,
          name: profile?.displayName || auth.currentUser.displayName || "User",
          email: auth.currentUser.email ?? "",
          avatar: profile?.photoURL || auth.currentUser.photoURL || null,
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

      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };


  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, refreshUser }} // ✅ ADAUGĂ refreshUser
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
