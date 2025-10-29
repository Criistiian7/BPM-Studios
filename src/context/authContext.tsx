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
import { PUBLIC_ROUTES, ACCOUNT_TYPES } from "../constants";
import { handleFirebaseError, useErrorHandler } from "../utils/errorHandler";

// Tipul pentru contextul de autentificare
type AuthContextType = {
  user: AppUser | null;          // Utilizatorul curent autentificat
  loading: boolean;              // Dacă se încarcă datele de autentificare
  register: (                   // Funcția pentru înregistrare
    email: string,
    password: string,
    name?: string,
    accountType?: AccountType
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;  // Funcția pentru login
  logout: () => Promise<void>;   // Funcția pentru logout
  refreshUser: () => Promise<void>;  // Funcția pentru actualizarea datelor utilizatorului
};

// Creează contextul de autentificare
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider-ul pentru contextul de autentificare
 * Gestionează starea de autentificare a utilizatorului în întreaga aplicație
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State-uri pentru gestionarea autentificării
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialAuthCheck, setInitialAuthCheck] = useState<boolean>(true);

  // Hook-uri pentru navigare și error handling
  const navigate = useNavigate();
  const location = useLocation();
  const { handleError } = useErrorHandler();

  /**
   * Creează un utilizator de bază cu datele din Firebase Auth
   * Pentru a reduce timpul de încărcare
   */
  const createBasicUser = (firebaseUser: User): AppUser => ({
    id: firebaseUser.uid,
    name: firebaseUser.displayName ?? firebaseUser.email ?? "User",
    email: firebaseUser.email ?? "",
    avatar: firebaseUser.photoURL ?? null,
    accountType: ACCOUNT_TYPES.ARTIST,
    rating: 0,
  });

  /**
   * Încarcă datele complete ale utilizatorului din Firestore
   */
  const loadUserProfile = async (firebaseUser: User): Promise<AppUser> => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnapshot = await getDoc(userRef);

      if (userSnapshot.exists()) {
        const profileData = userSnapshot.data();
        const accountType = (profileData?.accountType ?? ACCOUNT_TYPES.ARTIST) as AccountType;
        const rating = typeof profileData?.rating === "number" ? profileData.rating : 0;

        return {
          id: firebaseUser.uid,
          name: profileData?.displayName || firebaseUser.displayName || "User",
          email: firebaseUser.email ?? "",
          avatar: profileData?.photoURL || firebaseUser.photoURL || null,
          accountType,
          rating,
          studioId: profileData?.studioId ?? undefined,
        };
      }

      // Returnează utilizatorul de bază dacă nu există profil în Firestore
      return createBasicUser(firebaseUser);
    } catch (error) {
      handleError(error, 'AuthContext.loadUserProfile');
      return createBasicUser(firebaseUser);
    }
  };

  /**
   * Gestionează redirectionarea utilizatorului după autentificare
   */
  const handleUserRedirect = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      // Redirectionează la profil dacă utilizatorul este pe paginile de autentificare
      if (location.pathname === "/login" || location.pathname === "/register") {
        navigate("/profile");
      }
    } else {
      // Redirectionează la pagina principală dacă nu este pe o pagină publică
      if (initialAuthCheck && !PUBLIC_ROUTES.includes(location.pathname as any)) {
        navigate("/home");
      }
    }
  };

  // Effect pentru gestionarea schimbărilor de autentificare
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Setează utilizatorul de bază imediat pentru loading mai rapid
        const basicUser = createBasicUser(firebaseUser);
        setUser(basicUser);
        setLoading(false);

        // Încarcă datele complete în background
        try {
          const fullUser = await loadUserProfile(firebaseUser);
          setUser(fullUser);
        } catch (error) {
          handleError(error, 'AuthContext.onAuthStateChanged');
        }

        handleUserRedirect(true);
      } else {
        // Utilizatorul nu este autentificat
        setUser(null);
        setLoading(false);
        handleUserRedirect(false);
      }

      setInitialAuthCheck(false);
    });

    return () => unsubscribe();
  }, [location.pathname, initialAuthCheck]);

  /**
   * Funcția pentru înregistrarea unui nou utilizator
   * @param email - Email-ul utilizatorului
   * @param password - Parola utilizatorului
   * @param name - Numele utilizatorului (opțional)
   * @param accountType - Tipul de cont (artist, producer, studio)
   */
  const register = async (
    email: string,
    password: string,
    name?: string,
    accountType: AccountType = ACCOUNT_TYPES.ARTIST
  ) => {
    try {
      // Creează contul în Firebase Auth
      const credentials = await createUserWithEmailAndPassword(auth, email, password);

      if (credentials.user) {
        // Actualizează profilul cu numele dacă este furnizat
        if (name) {
          await updateProfile(credentials.user, { displayName: name }).catch(() => {
            console.warn("Nu s-a putut actualiza numele utilizatorului");
          });
        }

        // Creează documentul de profil în Firestore
        const userRef = doc(db, "users", credentials.user.uid);
        await setDoc(userRef, {
          uid: credentials.user.uid,
          email: credentials.user.email,
          displayName: name || credentials.user.displayName || "User",
          photoURL: credentials.user.photoURL,
          accountType,
          rating: 0,
          description: "",
          genre: "",
          location: "",
          phoneNumber: null,
          socialLinks: {
            facebook: null,
            instagram: null,
            youtube: null,
          },
          statistics: {
            tracksUploaded: 0,
            projectsCompleted: 0,
          },
          memberSince: new Date().toLocaleDateString(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      throw handleFirebaseError(error);
    }
  };

  /**
   * Funcția pentru autentificarea utilizatorului
   * @param email - Email-ul utilizatorului
   * @param password - Parola utilizatorului
   */
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  };

  /**
   * Funcția pentru deconectarea utilizatorului
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  };

  /**
   * Funcția pentru actualizarea datelor utilizatorului
   */
  const refreshUser = async () => {
    if (user) {
      try {
        const userRef = doc(db, "users", user.id);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          const profileData = userSnapshot.data();
          const accountType = (profileData?.accountType ?? ACCOUNT_TYPES.ARTIST) as AccountType;
          const rating = typeof profileData?.rating === "number" ? profileData.rating : 0;

          setUser({
            id: user.id,
            name: profileData?.displayName || user.name,
            email: user.email,
            avatar: profileData?.photoURL || user.avatar,
            accountType,
            rating,
            studioId: profileData?.studioId ?? undefined,
          });
        }
      } catch (error) {
        handleError(error, 'AuthContext.refreshUser');
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    register,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook pentru utilizarea contextului de autentificare
 * @returns Contextul de autentificare
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth trebuie folosit în cadrul unui AuthProvider");
  }
  return context;
};