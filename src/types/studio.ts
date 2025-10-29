import type { AccountType } from "./user";

// Interfața pentru un studio muzical
export interface Studio {
  id: string; // ID-ul unic al studio-ului
  ownerId: string; // ID-ul proprietarului studio-ului
  ownerName?: string; // Numele proprietarului studio-ului
  name: string; // Numele studio-ului
  description: string; // Descrierea studio-ului
  photoURL: string | null; // URL-ul fotografiei studio-ului

  // Informații de contact
  email?: string; // Email-ul studio-ului
  location?: string; // Locația studio-ului
  phoneNumber?: string; // Numărul de telefon

  // Link-uri sociale
  socialLinks?: {
    facebook: string | null; // Link-ul Facebook
    instagram: string | null; // Link-ul Instagram
    youtube: string | null; // Link-ul YouTube
  };

  // Membri și statistici
  memberIds: string[]; // Array cu ID-urile membrilor
  trackCount: number; // Numărul de track-uri din studio
  rating?: number; // Rating-ul mediu al studio-ului

  // Timestamps
  createdAt: string; // Data creării
  updatedAt: string; // Data ultimei actualizări
}

// Interfața pentru un membru al studio-ului
export interface StudioMember {
  id: string; // ID-ul unic al membrului
  uid: string; // ID-ul utilizatorului din Firebase Auth
  displayName: string; // Numele afișat al membrului
  email: string; // Email-ul membrului
  photoURL: string | null; // URL-ul fotografiei membrului
  accountType: AccountType; // Tipul de cont al membrului
  joinedAt: string; // Data aderării la studio
}
