# 🚀 Quick Start Guide

Acest ghid te va ajuta să configurezi și să rulezi proiectul în mai puțin de 5 minute.

## ⚡ Setup Rapid (5 minute)

### 1️⃣ Instalare

```bash
# Clonează repository-ul
git clone <repository-url>
cd <project-directory>

# Instalează dependențele
npm install
```

### 2️⃣ Configurare Firebase

1. Accesează [Firebase Console](https://console.firebase.google.com/)
2. Creează un proiect nou
3. Activează **Authentication** → Email/Password
4. Creează **Firestore Database** → Start in test mode
5. Configurează **Storage** → Start in test mode

### 3️⃣ Variabile de Mediu

```bash
# Copiază fișierul de exemplu
cp .env.example .env

# Editează .env cu credențialele din Firebase Console
# Project Settings → General → Your apps → Web app
```

Exemplu `.env`:
```env
VITE_API_KEY=AIzaSyC...
VITE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_PROJECT_ID=your-app
VITE_STORAGE_BUCKET=your-app.appspot.com
VITE_MESSAGING_SENDER_ID=123456789
VITE_APP_ID=1:123456789:web:abc123
VITE_MEASUREMENT_ID=G-ABC123
```

### 4️⃣ Rulează Aplicația

```bash
npm run dev
```

Deschide [http://localhost:5173](http://localhost:5173) în browser! 🎉

## 🎯 Pași Următori

### Configurare Firebase Security Rules

După ce ai testat aplicația, configurează regulile de securitate:

#### Firestore Rules

În Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /tracks/{trackId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
    
    match /studios/{studioId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == studioId;
    }
    
    match /requests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    match /connections/{connectionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

#### Storage Rules

În Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /studios/{studioId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == studioId;
    }
    
    match /tracks/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Testare

```bash
# Creează un cont nou în aplicație
# Email: test@example.com
# Password: Test123!

# Explorează funcționalitățile:
# ✅ Editează profilul
# ✅ Încarcă un track audio
# ✅ Caută alți utilizatori în Community
# ✅ Trimite connection requests
```

## 📝 Comenzi Utile

```bash
# Development
npm run dev          # Pornește dev server

# Build
npm run build        # Build pentru producție
npm run preview      # Preview build local

# Code Quality
npm run lint         # Verifică codul cu ESLint
npm test            # Rulează testele

# Deployment
# Vezi NETLIFY_DEPLOY.md pentru deployment
```

## 🆘 Troubleshooting

### Eroare: "Firebase config is not defined"
- Verifică că ai copiat `.env.example` la `.env`
- Verifică că toate variabilele VITE_* sunt completate
- Restart dev server după modificarea `.env`

### Eroare: "Permission denied" în Firestore
- Verifică că ai configurat Security Rules
- Asigură-te că ești autentificat în aplicație

### Build errors
```bash
# Șterge node_modules și reinstalează
rm -rf node_modules package-lock.json
npm install
```

### Port ocupat (5173)
```bash
# Oprește procesul pe portul 5173
lsof -ti:5173 | xargs kill -9

# Sau rulează pe alt port
npm run dev -- --port 3000
```

## 🎓 Învață Mai Mult

- 📚 [React Documentation](https://react.dev/)
- 🔥 [Firebase Documentation](https://firebase.google.com/docs)
- ⚡ [Vite Guide](https://vitejs.dev/guide/)
- 🎨 [Tailwind CSS Docs](https://tailwindcss.com/docs)

## ✅ Checklist Setup

- [ ] Node.js 18+ instalat
- [ ] Dependențe instalate (`npm install`)
- [ ] Proiect Firebase creat
- [ ] Authentication activat
- [ ] Firestore Database creat
- [ ] Storage configurat
- [ ] Fișier `.env` creat și completat
- [ ] Dev server pornit (`npm run dev`)
- [ ] Cont de test creat în aplicație
- [ ] Security Rules configurate

## 🎉 Success!

Dacă ai reușit să parcurgi toți pașii, ar trebui să ai acum o aplicație funcțională!

Pentru îmbunătățiri și best practices, vezi:
- 📋 **SUGESTII_IMBUNATATIRE.md** - Recomandări detaliate
- 📖 **README.md** - Documentație completă

---

**Need help?** Deschide un issue sau contactează echipa de dezvoltare.
