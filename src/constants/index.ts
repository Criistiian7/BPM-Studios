/**
 * Application constants
 */

export const TRACK_STATUS = {
  WORK_IN_PROGRESS: "Work in Progress",
  PRE_RELEASE: "Pre-Release",
  RELEASE: "Release",
} as const;

export const ACCOUNT_TYPES = {
  ARTIST: "artist",
  PRODUCER: "producer",
  STUDIO: "studio",
} as const;

export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  AUDIO: 50 * 1024 * 1024, // 50MB
} as const;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: "Fișierul este prea mare",
  INVALID_IMAGE: "Te rog selectează o imagine validă",
  UPLOAD_FAILED: "Eroare la încărcare",
  NETWORK_ERROR: "Eroare de rețea. Te rog încearcă din nou",
  REQUIRED_FIELD: "Acest câmp este obligatoriu",
  INVALID_EMAIL: "Adresa de email nu este validă",
} as const;

