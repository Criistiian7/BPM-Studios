// Tipurile de status pentru track-uri
export type TrackStatus = "Work in Progress" | "Pre-Release" | "Release";

// Interfața pentru un track muzical
export interface Track {
  id: string;                     // ID-ul unic al track-ului
  userId: string;                  // ID-ul utilizatorului care a încărcat track-ul
  title: string;                   // Titlul track-ului
  description: string;              // Descrierea track-ului
  
  status: TrackStatus;             // Statusul track-ului
  genre: string;                   // Genul muzical al track-ului
  audioURL: string;                // URL-ul fișierului audio
  
  // Informații despre rating
  rating?: number;                 // Rating-ul mediu al track-ului
  ratingCount?: number;            // Numărul de evaluări primite
  
  // Colaboratori
  collaborators?: string[];        // Array cu ID-urile colaboratorilor
  
  // Timestamps
  createdAt: string;              // Data creării
  updatedAt?: string;             // Data ultimei actualizări
}
