export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Înlocuiește spații cu -
    .replace(/[^\w\-]+/g, "") // Elimină caractere speciale
    .replace(/\-\-+/g, "-") // Înlocuiește multiple - cu unul singur
    .replace(/^-+/, "") // Elimină - de la început
    .replace(/-+$/, ""); // Elimină - de la sfârșit
};

// Funcție pentru a genera slug unic cu ID
export const generateUserSlug = (displayName: string, uid: string): string => {
  const baseSlug = slugify(displayName);
  // Adaugă primele 6 caractere din UID pentru unicitate
  return `${baseSlug}-${uid.substring(0, 6)}`;
};
