export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  description: string;
  rating: number;
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
