# 📚 Ghid Proiect - BPM Studios

**Proiect Final Bootcamp** pentru producători muzicali și artiști

---

## 🎯 Ce Este BPM Studios?

O platformă web unde producătorii pot:
- Crea un profil de studio
- Upload tracks muzicale
- Colabora cu artiști
- Primi rating-uri
- Networking cu comunitatea

---

## 🛠️ Tehnologii Folosite

### Ce am învățat în bootcamp:

**Frontend:**
- **React 18** - Pentru UI interactiv
- **TypeScript** - Pentru cod mai sigur (type safety)
- **React Router** - Pentru navigare între pagini
- **Tailwind CSS** - Pentru styling rapid

**Backend:**
- **Firebase Auth** - Autentificare users
- **Firestore** - Bază de date (NoSQL)
- **Firebase Storage** - Pentru imagini și audio files

**Tools:**
- **Vite** - Build tool modern și rapid
- **ESLint** - Verificare calitate cod

---

## 📁 Structură Cod

```
src/
├── pages/              # Paginile aplicației
│   ├── Home.tsx
│   ├── Studio.tsx      # Studio management (970 linii)
│   ├── Dashboard/
│   └── UserProfile.tsx
│
├── components/         # Componente reutilizabile
│   ├── common/         # Componente simple (LoadingSpinner, Avatar, Button)
│   ├── AudioPlayer.tsx # Player pentru tracks
│   └── community.tsx   # Comunitate users
│
├── hooks/              # Custom hooks
│   ├── useAlert.ts
│   └── useTrackNavigation.ts
│
├── utils/              # Funcții helper
│   ├── formatters.ts   # getInitials, formatTime
│   └── validation.ts   # Validări
│
├── context/            # React Context
│   └── authContext.tsx # Autentificare globală
│
└── firebase/           # Firebase setup
    ├── firebase.ts
    └── ratings.ts
```

---

## 🎓 Concepte Învățate

### **1. React Hooks**
```typescript
// State management
const [studio, setStudio] = useState<Studio | null>(null);

// Side effects (data loading)
useEffect(() => {
  loadData();
}, [dependency]);

// Custom hook (pentru reusability)
const { autoPlayTrackId, handleNext } = useTrackNavigation(tracks);
```

### **2. TypeScript**
```typescript
// Types pentru safety
interface Studio {
  id: string;
  name: string;
  photoURL: string | null;
}

// Type-safe components
const Studio: React.FC = () => { ... };
```

### **3. Firebase**
```typescript
// Read data
const docSnap = await getDoc(doc(db, "studios", id));

// Write data
await setDoc(doc(db, "studios", id), data);

// Upload file
const storageRef = ref(storage, `path/${fileName}`);
await uploadBytes(storageRef, file);
```

### **4. Bune Practici**
```typescript
// DRY - Componentă reutilizabilă
<LoadingSpinner fullScreen />

// Utils pentru funcții comune
import { getInitials } from "@/utils/formatters";

// Validare input
if (file.size > 5 * 1024 * 1024) {
  showError("Fișier prea mare");
}
```

---

## 📊 Performanță

**Am optimizat:**
- ✅ Lazy loading pentru pages
- ✅ Image lazy loading (loading="lazy")
- ✅ useCallback pentru event handlers
- ✅ Firebase queries optimizate

**Rezultat:**
- Load time: ~1.4s
- Performance score: ~90/100
- Responsive: Da (mobile, tablet, desktop)

---

## 🎯 Features Principale

1. **Autentificare** - Email/parolă cu Firebase Auth
2. **Studio Management** - Upload tracks, editare profil
3. **Audio Player** - Play/pause, navigation, volume
4. **Rating System** - Rating tracks (1-5 stele)
5. **Community** - Browse users, send connections
6. **Dashboard** - My tracks, contacts, requests

---

## 💡 De Ce Am Structurat Așa

### **Studio.tsx (970 linii):**
> Am păstrat tot într-un fișier pentru că feature-ul e complex
> și vreau ca flow-ul să fie clar. E mai ușor să urmăresc logica.

### **Componente Comune:**
> Am văzut că LoadingSpinner se repeta în 8 locații, așa că
> l-am făcut componentă reutilizabilă (DRY principle).

### **Custom Hooks:**
> Logic-ul de track navigation se repeta, l-am extras în hook
> pentru a evita duplicarea codului.

### **Utils:**
> Funcții ca getInitials și formatTime sunt folosite în multe
> locuri, așa că le-am pus în utils/ pentru reusability.

---

## 🚀 Cum Să Rulezi

```bash
# 1. Instalează dependencies
npm install

# 2. Pornește development server
npm run dev

# 3. Deschide în browser
http://localhost:5173
```

---

## 📚 Documentație Completă

- `FUNCTIONALITATI.md` - Toate features detaliate
- `RATING_SYSTEM.md` - Cum funcționează rating-ul
- `COLLABORATORS_SYSTEM.md` - Sistem de colaborare
- `STUDIO_MANAGEMENT.md` - Studio features

---

**🎓 Proiect realizat ca parte a bootcamp-ului final**

**Nivel:** Junior cu bune practici  
**Performanță:** ~90/100 ✅

