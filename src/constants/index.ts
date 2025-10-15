export const ROUTES = {
  HOME: '/',
  AUTH: '/auth', 
  DASHBOARD: '/profile',
  COMMUNITY: '/community',
  STUDIO: '/studio',
  PROFILE_EDIT: '/profile-edit'
} as const;

export const ACCOUNT_TYPES = {
  ARTIST: 'artist',
  PRODUCER: 'producer', 
  STUDIO: 'studio'
} as const;

export const TRACK_STATUSES = {
  WORK_IN_PROGRESS: 'Work in Progress',
  PRE_RELEASE: 'Pre-Release',
  RELEASE: 'Release'
} as const;

export const SOCIAL_PLATFORMS = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube'
} as const;