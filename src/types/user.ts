// Tipurile de conturi disponibile în aplicație
export type AccountType =
  | "producer"
  | "Producer"
  | "artist"
  | "Artist"
  | "studio";

// Interfața pentru profilul utilizatorului în Firestore
export interface UserProfile {
  uid: string; // ID-ul unic al utilizatorului
  slug?: string; // Slug-ul pentru URL-uri prietenoase
  email: string | null; // Email-ul utilizatorului
  displayName: string | null; // Numele afișat al utilizatorului
  photoURL: string | null; // URL-ul fotografiei de profil
  description: string; // Descrierea utilizatorului
  rating: number; // Rating-ul mediu al utilizatorului
  accountType: AccountType; // Tipul de cont (artist, producer, studio)
  genre: any; // Genul muzical preferat

  // Statisticile utilizatorului
  statistics: {
    tracksUploaded: number; // Numărul de track-uri încărcate
    projectsCompleted: number; // Numărul de proiecte finalizate
  };

  // Link-urile sociale ale utilizatorului
  socialLinks: {
    facebook: string | null; // Link-ul Facebook
    instagram: string | null; // Link-ul Instagram
    youtube: string | null; // Link-ul YouTube
  };

  location: string; // Locația utilizatorului
  phoneNumber: string | null; // Numărul de telefon
  memberSince: string; // Data înregistrării

  // Câmpuri specifice pentru studio-uri (opționale)
  studioId?: string; // ID-ul studio-ului
  ownerId?: string; // ID-ul proprietarului
  ownerName?: string; // Numele proprietarului
  ownerEmail?: string; // Email-ul proprietarului
  ownerAvatar?: string | null; // Avatar-ul proprietarului
}

// Interfața pentru utilizatorul din aplicație (simplificată)
export interface AppUser {
  id: string; // ID-ul unic al utilizatorului
  name: string; // Numele utilizatorului
  email: string; // Email-ul utilizatorului
  slug?: string; // Slug-ul pentru URL-uri prietenoase
  avatar?: string | null; // URL-ul fotografiei de profil

  accountType: AccountType; // Tipul de cont
  rating: number; // Rating-ul mediu

  // Câmpuri opționale pentru profilul complet
  description?: string; // Descrierea utilizatorului
  genre?: string; // Genul muzical preferat
  location?: string; // Locația utilizatorului
  phoneNumber?: string | null; // Numărul de telefon

  // Link-urile sociale
  socialLinks?: {
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
  };

  // Statisticile utilizatorului
  statistics?: {
    tracksUploaded: number;
    projectsCompleted: number;
  };

  // Câmpuri specifice pentru studio-uri
  studioId?: string; // ID-ul studio-ului (pentru artiști membri)

  memberSince?: string; // Data înregistrării
}
