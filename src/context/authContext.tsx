import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
import { handleFirebaseError, useErrorHandler, logger } from "../utils/errorHandler";

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
          // Câmpuri suplimentare pentru ProfileCard
          description: profileData?.description ?? undefined,
          location: profileData?.location ?? undefined,
          phoneNumber: profileData?.phoneNumber ?? undefined,
          genre: typeof profileData?.genre === "string" ? profileData.genre : undefined,
          socialLinks: profileData?.socialLinks ? {
            facebook: profileData.socialLinks.facebook ?? null,
            instagram: profileData.socialLinks.instagram ?? null,
            youtube: profileData.socialLinks.youtube ?? null,
          } : undefined,
          statistics: profileData?.statistics ? {
            tracksUploaded: typeof profileData.statistics.tracksUploaded === "number" 
              ? profileData.statistics.tracksUploaded 
              : 0,
            projectsCompleted: typeof profileData.statistics.projectsCompleted === "number"
              ? profileData.statistics.projectsCompleted
              : 0,
          } : undefined,
          memberSince: profileData?.memberSince ?? undefined,
          slug: profileData?.slug ?? undefined,
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
      if (initialAuthCheck && !PUBLIC_ROUTES.includes(location.pathname as (typeof PUBLIC_ROUTES)[number])) {
        navigate("/home");
      }
    }
  };

  // Effect pentru gestionarea schimbărilor de autentificare
  useEffect(() => {
    let isMounted = true; // Flag pentru a evita actualizările de stare după unmount

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      // Ignoră actualizările dacă componenta nu este montată
      if (!isMounted) return;

      if (firebaseUser) {
        // Setează utilizatorul de bază imediat pentru loading mai rapid
        const basicUser = createBasicUser(firebaseUser);
        if (isMounted) {
          setUser(basicUser);
          setLoading(false);
        }

        // Încarcă datele complete în background
        try {
          const fullUser = await loadUserProfile(firebaseUser);
          if (isMounted) {
            setUser(fullUser);
          }
        } catch (error) {
          // Ignoră erorile Firestore dacă utilizatorul s-a deconectat între timp
          if (isMounted && auth.currentUser) {
            handleError(error, 'AuthContext.onAuthStateChanged');
          }
        }

        if (isMounted) {
          handleUserRedirect(true);
        }
      } else {
        // Utilizatorul nu este autentificat
        if (isMounted) {
          setUser(null);
          setLoading(false);
          handleUserRedirect(false);
        }
      }

      if (isMounted) {
        setInitialAuthCheck(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [location.pathname, initialAuthCheck]);

  /**
   * Funcția pentru înregistrarea unui nou utilizator
   * @param email - Email-ul utilizatorului
   * @param password - Parola utilizatorului
   * @param name - Numele utilizatorului (opțional)
   * @param accountType - Tipul de cont (artist, producer, studio)
   */
  const register = useCallback(async (
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
            logger.warn("Nu s-a putut actualiza numele utilizatorului");
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
  }, []);

  /**
   * Funcția pentru autentificarea utilizatorului
   * @param email - Email-ul utilizatorului
   * @param password - Parola utilizatorului
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw handleFirebaseError(error);
    }
  }, []);

  /**
   * Funcția pentru deconectarea utilizatorului
   */
  const logout = useCallback(async () => {
    try {
      // Resetează starea utilizatorului înainte de logout pentru a preveni erorile Firestore
      setUser(null);
      setLoading(true);
      
      // Realizează logout-ul
      await signOut(auth);
      
      // Navighează la homepage după logout
      navigate("/home", { replace: true });
    } catch (error) {
      // Chiar dacă apare o eroare, resetează starea
      setUser(null);
      setLoading(false);
      throw handleFirebaseError(error);
    }
  }, [navigate]);

  /**
   * Funcția pentru actualizarea datelor utilizatorului
   */
  const refreshUser = useCallback(async () => {
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
  }, [user, handleError]);

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