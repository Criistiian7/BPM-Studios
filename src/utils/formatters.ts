/**
 * Utility functions for formatting data
 */

/**
 * Get initials from a name
 * @param name - The full name
 * @param maxChars - Maximum number of characters to return (default: 2)
 * @returns Initials in uppercase
 */
export const getInitials = (name: string, maxChars: number = 2): string => {
  if (!name || name.trim() === "") return "?";

  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, maxChars)
    .join("")
    .toUpperCase();
};

/**
 * Format time in seconds to MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export const formatTime = (seconds: number): string => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

/**
 * Normalizează accountType la format standard (lowercase)
 * Acceptă: "producer", "Producer", "Producător", "producător" -> "producer"
 * @param accountType - Tipul de cont (poate fi în diverse formate)
 * @returns Tipul de cont normalizat
 */
export const normalizeAccountType = (
  accountType: string | undefined | null
): "producer" | "artist" | "studio" => {
  if (!accountType) return "artist"; // default

  const normalized = accountType.toLowerCase().trim();

  // Normalizează toate variantele de producer
  if (
    normalized === "producer" ||
    normalized === "producător" ||
    normalized === "produces"
  ) {
    return "producer";
  }

  if (normalized === "studio") {
    return "studio";
  }

  // Default pentru artist
  return "artist";
};

/**
 * Convertește accountType normalizat la text afișabil în română
 * @param accountType - Tipul de cont
 * @returns Eticheta în română pentru tipul de cont
 */
export const getAccountTypeLabel = (
  accountType: string | undefined | null
): string => {
  const normalized = normalizeAccountType(accountType);

  switch (normalized) {
    case "producer":
      return "Producător";
    case "artist":
      return "Artist";
    case "studio":
      return "Studio";
    default:
      return "Artist";
  }
};

/**
 * Verifică dacă accountType este producer (acceptă toate variantele)
 * @param accountType - Tipul de cont de verificat
 * @returns true dacă este producer
 */
export const isProducer = (accountType: string | undefined | null): boolean => {
  return normalizeAccountType(accountType) === "producer";
};

/**
 * Verifică dacă accountType este artist (acceptă toate variantele)
 * @param accountType - Tipul de cont de verificat
 * @returns true dacă este artist
 */
export const isArtist = (accountType: string | undefined | null): boolean => {
  return normalizeAccountType(accountType) === "artist";
};

/**
 * Verifică dacă accountType este studio
 * @param accountType - Tipul de cont de verificat
 * @returns true dacă este studio
 */
export const isStudio = (accountType: string | undefined | null): boolean => {
  return normalizeAccountType(accountType) === "studio";
};
