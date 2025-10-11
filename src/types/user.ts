export type AccountType = "producer" | "artist";

export interface UserProfile {
  genre: any;
  uid: string;
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
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  accountType: AccountType;
  rating: number;
}
