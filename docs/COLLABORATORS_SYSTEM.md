# Sistem Colaboratori - BPM Studios

## 📋 Overview

Sistem complet pentru colaborare între artiști la tracks, cu afișare dinamică și real-time updates.

---

## 🎯 Features

### **Afișare Colaboratori**

```
Uploaded by: Studio Name
Featuring with: Artist 1, Artist 2 și +3 alții
```

- Primii 2 colaboratori cu linkuri către profiluri
- "+X alții" pentru restul
- Actualizare real-time când colaboratorul își schimbă numele

### **Salvare în Firebase**

```typescript
{
  collaborators: ["userId1", "userId2"], // Array de IDs
  ownerName: "John Doe",
  uploadedByStudio: true/false,
  studioName: "ComBeat" // dacă e de la studio
}
```

---

## 🔄 Real-time Updates

**Implementare:**

```typescript
// onSnapshot listener pentru fiecare colaborator
const collaboratorsKey = useMemo(
  () => collaborators?.join(",") || "",
  [collaborators]
);

useEffect(() => {
  collaborators.forEach((id) => {
    onSnapshot(doc(db, "users", id), (snap) => {
      // Update nume și slug automat
    });
  });
}, [collaboratorsKey]);
```

**Beneficii:**

- Schimbări instant când colaborator își modifică profilul
- Cleanup automat listeners
- Optimizat cu memoization

---

## 📁 Fișiere Principale

**AudioPlayer.tsx** - Afișare și fetch colaboratori  
**MyTracks.tsx** - Upload cu colaboratori din contacte  
**Studio.tsx** - Upload cu colaboratori din membri studio  
**UserProfile.tsx** - Afișare tracks owned + collaborated  
**firebase/api.ts** - Salvare collaborators în Firestore

---

## 🐛 Debugging

**Dacă colaboratorii nu apar:**

1. Verifică console: `🎵 AudioPlayer - Collaborators received`
2. Verifică că track-ul are `collaborators` array în Firebase
3. Verifică că user IDs există în colecția `users`

**Pentru track-uri vechi:**

- Re-încarcă track-ul SAU
- Edit track → bifează "Există colaboratori?" → Save

**Data:** 19 Octombrie 2025
