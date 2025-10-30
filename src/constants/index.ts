/**
 * Configurații centralizate pentru aplicația BeatPlanner
 * Conține toate constantele și valorile hardcodate pentru ușurința mentenanței
 */

// Configurații pentru animații
export const ANIMATION_CONFIG = {
  DURATIONS: {
    FAST: 300,
    NORMAL: 500,
    SLOW: 1000,
    VERY_SLOW: 2000,
  },
  DELAYS: {
    SHORT: 2000,
    MEDIUM: 4000,
    LONG: 8000,
  },
} as const;

// Configurații pentru breakpoints responsive
export const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1280,
  EXTRA_LARGE: 1536,
} as const;

// Configurații pentru utilizatori speciali
export const SPECIAL_USERS = {
  CORRECT_ID: "5m5YRMC93ESoHh5LyfkKEUkhZaF3",
} as const;

// Configurații pentru Firebase Collections
export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  STUDIOS: "studios",
  TRACKS: "tracks",
  CONNECTIONS: "connections",
  REQUESTS: "requests",
  RATINGS: "ratings",
} as const;

// Configurații pentru tipuri de cont
export const ACCOUNT_TYPES = {
  ARTIST: "artist",
  ARTIST_CAPITAL: "Artist",
  PRODUCER: "producer",
  PRODUCER_CAPITAL: "Producer",
  STUDIO: "studio",
} as const;

// Configurații pentru status-uri de track
export const TRACK_STATUSES = {
  WORK_IN_PROGRESS: "Work in Progress",
  PRE_RELEASE: "Pre-Release",
  RELEASE: "Release",
} as const;

// Configurații pentru tipuri de cereri
export const REQUEST_TYPES = {
  CONNECTION: "connection",
  STUDIO_JOIN: "studio_join",
} as const;

// Configurații pentru localStorage keys
// NOTE: Storage keys are now defined in utils/localStorage.ts
// This is kept for backward compatibility
export const STORAGE_KEYS = {
  THEME: "theme",
  REGISTER_FORM: "bpm_register_form_data",
  USER_PREFERENCES: "bpm_user_preferences",
} as const;

// Configurații pentru rute publice
export const PUBLIC_ROUTES = [
  "/home",
  "/",
  "/login",
  "/register",
  "/community",
  "/demo-community",
] as const;

// Configurații pentru dimensiuni de avatar
export const AVATAR_SIZES = {
  SMALL: 32,
  MEDIUM: 48,
  LARGE: 64,
  EXTRA_LARGE: 96,
} as const;

// Configurații pentru limite de caractere
export const CHARACTER_LIMITS = {
  NAME: 50,
  DESCRIPTION: 500,
  BIO: 1000,
  TITLE: 100,
} as const;

// Configurații pentru paginare
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const;

// Configurații pentru validare
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[1-9][\d]{0,15}$/,
  PASSWORD_MIN_LENGTH: 6,
} as const;

// Configurații pentru timeout-uri
export const TIMEOUTS = {
  API_REQUEST: 10000,
  UPLOAD: 30000,
  AUTH_CHECK: 5000,
} as const;

// Configurații pentru error codes
export const ERROR_CODES = {
  USER_NOT_FOUND: "auth/user-not-found",
  WRONG_PASSWORD: "auth/wrong-password",
  PERMISSION_DENIED: "permission-denied",
  NETWORK_ERROR: "network-error",
  VALIDATION_ERROR: "validation-error",
} as const;

// Configurații pentru mesaje de eroare
export const ERROR_MESSAGES = {
  [ERROR_CODES.USER_NOT_FOUND]: "Utilizatorul nu a fost găsit",
  [ERROR_CODES.WRONG_PASSWORD]: "Parola este incorectă",
  [ERROR_CODES.PERMISSION_DENIED]: "Nu ai permisiunea necesară",
  [ERROR_CODES.NETWORK_ERROR]: "Eroare de conexiune la internet",
  [ERROR_CODES.VALIDATION_ERROR]: "Datele introduse nu sunt valide",
  DEFAULT: "A apărut o eroare neașteptată",
} as const;

// Configurații pentru success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Te-ai conectat cu succes!",
  REGISTER_SUCCESS: "Contul a fost creat cu succes!",
  PROFILE_UPDATE: "Profilul a fost actualizat!",
  TRACK_UPLOAD: "Track-ul a fost încărcat cu succes!",
  STUDIO_CREATE: "Studio-ul a fost creat cu succes!",
  CONNECTION_SENT: "Cererea de conectare a fost trimisă!",
  CONNECTION_ACCEPTED: "Cererea a fost acceptată!",
} as const;
