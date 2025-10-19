# Studio Management - BPM Studios

## 📋 Overview

Funcționalități complete pentru gestionarea studiourilor, membrii și tracks.

---

## 🏢 Features Studio

### **Editare Profil Studio**

- Nume, descriere, avatar
- Email dedicat studio (diferit de owner)
- Locație, telefon
- Social media (Facebook, Instagram, YouTube)

### **Upload Tracks**

- Upload de pe pagina Studio
- Colaboratori = membrii studio-ului (multi-select)
- Track salvat cu flag `uploadedByStudio: true`
- Afișare "Uploaded by: Studio Name" pe toate paginile

### **Gestionare Membri**

- Tab separat pentru membri
- Owner poate adăuga membri
- Membri apar în dropdown la upload

---

## 💾 Structură Date

```typescript
interface Studio {
  ownerId: string;
  name: string;
  email?: string;
  location?: string;
  phoneNumber?: string;
  socialLinks?: {
    facebook: string | null;
    instagram: string | null;
    youtube: string | null;
  };
  rating?: number; // Sincronizat cu owner
}
```

---

## 📊 Afișare Informații

**Header Studio:**

- Avatar + Nume
- Owner cu link către profil
- Tip profil + Rating
- Contact info (location, phone, email)
- Social media icons cu hover effects

**Track-uri Studio:**

```
Uploaded by: ComBeat  ← Numele studio-ului
Featuring with: Member 1, Member 2
```

---

## 📁 Fișiere

**pages/Studio.tsx** - Pagină completă studio  
**types/studio.ts** - Interface Studio  
**firebase/api.ts** - CRUD operations

**Data:** 19 Octombrie 2025
