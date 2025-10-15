# 🎵 Music Platform - Social Network pentru Muzicieni

O platformă social media modernă construită cu React, TypeScript, și Firebase, dedicată artiștilor, producătorilor, și studiourilor de muzică pentru a colabora și a-și promova munca.

## ✨ Funcționalități

- 🔐 **Autentificare securizată** cu Firebase Authentication
- 👤 **Profiluri personalizabile** pentru artiști, producători, și studiouri
- 🎼 **Upload și management de track-uri** audio
- 🤝 **Sistem de conexiuni** între utilizatori
- 🎚️ **Studio virtual** pentru producători
- 👥 **Comunitate** pentru descoperirea altor muzicieni
- 🎨 **Dark mode** și UI modern cu Tailwind CSS
- 📱 **Responsive design** pentru toate dispozitivele

## 🚀 Tehnologii Utilizate

- **Frontend:**
  - [React 19](https://react.dev/) - UI Library
  - [TypeScript](https://www.typescriptlang.org/) - Type Safety
  - [Vite](https://vitejs.dev/) - Build Tool
  - [Tailwind CSS](https://tailwindcss.com/) - Styling
  - [React Router](https://reactrouter.com/) - Routing
  - [React Hook Form](https://react-hook-form.com/) - Form Management

- **Backend:**
  - [Firebase Authentication](https://firebase.google.com/products/auth) - User Authentication
  - [Cloud Firestore](https://firebase.google.com/products/firestore) - Database
  - [Firebase Storage](https://firebase.google.com/products/storage) - File Storage

- **Dev Tools:**
  - [ESLint](https://eslint.org/) - Code Linting
  - [Vitest](https://vitest.dev/) - Testing Framework
  - [TypeScript ESLint](https://typescript-eslint.io/) - TypeScript Linting

## 📋 Prerequisite

Asigură-te că ai instalate următoarele:

- [Node.js](https://nodejs.org/) (versiunea 18 sau mai mare)
- [npm](https://www.npmjs.com/) sau [yarn](https://yarnpkg.com/)
- Un cont [Firebase](https://firebase.google.com/)

## 🛠️ Instalare și Configurare

### 1. Clonează repository-ul

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Instalează dependențele

```bash
npm install
```

### 3. Configurează Firebase

1. Creează un proiect nou în [Firebase Console](https://console.firebase.google.com/)
2. Activează **Authentication** (Email/Password)
3. Creează o **Cloud Firestore Database**
4. Configurează **Firebase Storage**
5. Obține credențialele din **Project Settings > General > Your apps**

### 4. Configurează variabilele de mediu

Creează un fișier `.env` în rădăcina proiectului:

```bash
cp .env.example .env
```

Completează fișierul `.env` cu credențialele tale Firebase:

```env
VITE_API_KEY=your_api_key_here
VITE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_project.appspot.com
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
VITE_MEASUREMENT_ID=your_measurement_id
```

### 5. Configurează Firebase Security Rules

#### Firestore Rules (`firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tracks collection
    match /tracks/{trackId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
    
    // Studios collection
    match /studios/{studioId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == studioId;
    }
    
    // Connection requests
    match /requests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow delete: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || resource.data.toUserId == request.auth.uid);
    }
    
    // Connections
    match /connections/{connectionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

#### Storage Rules (`storage.rules`):

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

## 🎮 Comenzi Disponibile

```bash
# Pornește serverul de development
npm run dev

# Build pentru producție
npm run build

# Preview build de producție
npm run preview

# Rulează linter
npm run lint

# Rulează testele
npm test

# Rulează testele cu UI
npm run test:ui

# Generează coverage report
npm run test:coverage
```

## 📁 Structura Proiectului

```
src/
├── api/              # API integrations
├── assets/           # Static assets (images, icons)
├── components/       # Reusable React components
│   ├── auth/        # Authentication components
│   ├── Layout/      # Layout components (Navbar, etc.)
│   └── ...
├── context/          # React Context providers
├── firebase/         # Firebase configuration and API
├── hooks/            # Custom React hooks
├── pages/            # Page components
│   ├── Dashboard/   # Dashboard features
│   └── ...
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── constants/        # Application constants
├── App.tsx           # Main App component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## 🧪 Testing

Proiectul folosește [Vitest](https://vitest.dev/) pentru testing:

```bash
# Rulează toate testele
npm test

# Rulează testele în watch mode
npm test -- --watch

# Generează coverage report
npm run test:coverage
```

## 🎨 Stilizare

Proiectul folosește **Tailwind CSS** pentru styling și include:
- Dark mode support
- Responsive design
- Custom color scheme bazat pe indigo/purple gradient
- Componente UI moderne și accesibile

## 🔒 Securitate

- ✅ Variabile de mediu pentru date sensibile
- ✅ Firebase Security Rules pentru Firestore și Storage
- ✅ Autentificare obligatorie pentru toate operațiunile
- ✅ Validare pe server-side prin Firebase Rules
- ✅ Input sanitization și validare

## 📈 Performance

- ⚡ Vite pentru build ultra-rapid
- 🎯 Code splitting și lazy loading (recomandat)
- 🔄 React Compiler activat pentru optimizări automate
- 📦 Tree shaking pentru bundle size redus

## 🤝 Contribuție

Contribuțiile sunt binevenite! Te rugăm să:

1. Fork repository-ul
2. Creează un branch pentru feature-ul tău (`git checkout -b feature/AmazingFeature`)
3. Commit schimbările (`git commit -m 'Add some AmazingFeature'`)
4. Push la branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

## 📝 License

Acest proiect este licențiat sub MIT License.

## 🐛 Raportare Bug-uri

Dacă găsești un bug sau ai o sugestie, te rugăm să deschizi un [Issue](issues).

## 📧 Contact

Pentru întrebări sau suport, te rugăm să ne contactezi prin [email/discord/etc].

---

**Note:**
- Verifică documentul `SUGESTII_IMBUNATATIRE.md` pentru recomandări de îmbunătățire
- Pentru deployment pe Netlify, vezi `NETLIFY_DEPLOY.md`
- Pentru accessibility guidelines, vezi `ACCESSIBILITY.md`

**Made with ❤️ for the music community**
