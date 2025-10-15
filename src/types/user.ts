export type AccountType = "producer" | "artist" | "studio";

export interface UserProfile {
  genre: any;
  uid: string;
  slug?: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  description: string;
  rating: number;
  accountType: AccountType;
  statistics: {
    tracksUploaded: number;
    projectsCompleted: number;
  };
  socialLinks: {
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
  };
  location: string;
  phoneNumber: string | null;
  memberSince: string;
  // Studio-specific fields (optional, only for studios)
  studioId?: string;
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerAvatar?: string | null;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  accountType: AccountType;
  rating: number;
  description?: string;
  genre?: string;
  location?: string;
  phoneNumber?: string | null;
  socialLinks?: {
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
  };
  statistics?: {
    tracksUploaded: number;
    projectsCompleted: number;
  };
  memberSince?: string;
}
