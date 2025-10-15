/**
 * Application-wide constants
 */

export const ACCOUNT_TYPES = {
  PRODUCER: "producer",
  ARTIST: "artist",
  STUDIO: "studio",
} as const;

export type AccountType = (typeof ACCOUNT_TYPES)[keyof typeof ACCOUNT_TYPES];

export const TRACK_STATUS = {
  WIP: "Work in Progress",
  PRE_RELEASE: "Pre-Release",
  RELEASE: "Release",
} as const;

export type TrackStatus = (typeof TRACK_STATUS)[keyof typeof TRACK_STATUS];

/**
 * File upload constraints
 */
export const FILE_CONSTRAINTS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_AUDIO_SIZE: 50 * 1024 * 1024, // 50MB
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
  ACCEPTED_AUDIO_TYPES: ["audio/mpeg", "audio/wav", "audio/mp3"],
} as const;

/**
 * Firebase collection names
 */
export const COLLECTIONS = {
  USERS: "users",
  TRACKS: "tracks",
  STUDIOS: "studios",
  REQUESTS: "requests",
  CONNECTIONS: "connections",
  CONTACTS: "contacts",
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile-edit",
  COMMUNITY: "/community",
  STUDIO: "/studio",
  USER_PROFILE: (slug: string) => `/profile/${slug}`,
} as const;
