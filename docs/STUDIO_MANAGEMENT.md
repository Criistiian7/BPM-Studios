# 🎚️ Studio Management

Features pentru managementul studioului (doar pentru Producers).

---

## 🎯 Ce Poți Face

1. **Editare Profil Studio**

   - Nume studio
   - Logo (upload imagine)
   - Descriere
   - Contact (email, telefon, locație)
   - Social media links

2. **Upload Tracks**

   - Fișier audio (MP3, WAV, FLAC)
   - Titlu, descriere, gen
   - Status (Work in Progress, Pre-Release, Release)

3. **Management Tracks**

   - Vezi toate tracks-urile
   - Audio player per track
   - Navigation între tracks (prev/next)

4. **Members**
   - Vezi membri studio (pentru viitor)

---

## 💻 Implementare

### **Studio Page:**

`src/pages/Studio.tsx` (970 linii)

**Structură:**

```typescript
const Studio = () => {
  // 1. State management
  const [studio, setStudio] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [activeTab, setActiveTab] = useState("tracks");

  // 2. Data loading
  useEffect(() => {
    loadStudioData();
  }, [user]);

  // 3. Handlers
  const handleSaveStudio = async () => { ... };
  const handleUploadTrack = async () => { ... };

  // 4. Render
  return (
    <div>
      {/* Header cu info studio */}
      {/* Tabs: Tracks / Members */}
      {/* Edit Modal */}
      {/* Upload Modal */}
    </div>
  );
};
```

---

## 📤 Upload Track Flow

```
1. User click "Upload Track"
2. Modal se deschide
3. User completează form:
   - Titlu (required)
   - Descriere
   - Gen muzical
   - Status
   - File audio (required)
4. Click "Upload"
5. Validare:
   - File size < 50MB
   - File type = audio
6. Upload la Firebase Storage
7. Salvare metadata în Firestore
8. Refresh lista tracks
9. Modal se închide
10. Success message
```

---

## 🖼️ Upload Logo Studio

**Validări:**

- Tip fișier: PNG sau JPG
- Dimensiune max: 5MB

**Cod:**

```typescript
const handleImageUpload = async (file) => {
  // Validare
  if (file.size > 5 * 1024 * 1024) {
    showError("Imagine prea mare");
    return;
  }

  // Upload la Storage
  const storageRef = ref(storage, `studios/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  // Actualizează state
  setEditPhotoURL(url);
};
```

---

## 🎨 UI Components

### **Header Studio:**

- Avatar/Logo
- Nume și descriere
- Contact info
- Social media
- Stats (membri, tracks)
- Butoane Edit/Upload

### **Tabs:**

- **Tracks** - Lista cu toate tracks-urile
- **Members** - Lista membri studio

### **Modals:**

- **Edit Studio** - Form pentru editare info
- **Upload Track** - Form pentru upload track nou

---

## 📊 Firestore Structure

```
studios/
  ├── {userId}
      ├── ownerId: string
      ├── name: string
      ├── description: string
      ├── photoURL: string
      ├── email: string
      ├── location: string
      ├── phoneNumber: string
      ├── socialLinks: {
      │     facebook, instagram, youtube
      │   }
      ├── memberIds: string[]
      └── timestamps

tracks/
  ├── {trackId}
      ├── userId: string (owner)
      ├── title: string
      ├── description: string
      ├── genre: string
      ├── status: string
      ├── audioURL: string
      ├── uploadedByStudio: boolean
      ├── studioName: string
      ├── studioId: string
      └── timestamps
```

---

## 🎓 Concepte Demonstr ate

- Firebase Storage pentru files (images, audio)
- Firestore pentru metadata
- Form handling cu state
- File validation
- Modal implementation
- Tabs UI pattern
- CRUD operations

---

**🎚️ Studio management complet implementat!**

Fișier principal: `src/pages/Studio.tsx`
