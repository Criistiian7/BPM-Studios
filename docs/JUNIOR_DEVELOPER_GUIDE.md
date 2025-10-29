# BeatPlanner - Ghid pentru Dezvoltatori Juniori

## 📋 Prezentare Generală

BeatPlanner este o platformă pentru colaborări muzicale care conectează artiști, producători și studio-uri. Acest ghid este destinat dezvoltatorilor juniori care lucrează la proiect.

## 🏗️ Structura Proiectului

```
src/
├── components/          # Componente reutilizabile
│   ├── common/          # Componente comune (Button, LoadingSpinner, etc.)
│   ├── auth/            # Componente pentru autentificare
│   └── Layout/          # Componente pentru layout
├── context/             # Context-uri React (AuthContext)
├── hooks/               # Hook-uri personalizate
├── pages/               # Pagini ale aplicației
├── types/               # Definiții TypeScript
├── utils/                # Funcții utilitare
└── firebase/             # Configurația Firebase
```

## 🎯 Concepte Cheie pentru Juniori

### 1. Componente React

**Componenta Button** (`src/components/common/Button.tsx`)

```typescript
// Exemplu de utilizare
<Button variant="primary" size="md" isLoading={false} onClick={handleClick}>
  Apasă aici
</Button>
```

**Componenta LoadingSpinner** (`src/components/common/LoadingSpinner.tsx`)

```typescript
// Afișează un spinner de încărcare
<LoadingSpinner size="lg" message="Se încarcă..." fullScreen={true} />
```

### 2. Gestionarea Stării cu Context

**AuthContext** (`src/context/authContext.tsx`)

```typescript
// Folosește hook-ul useAuth pentru a accesa datele utilizatorului
const { user, loading, login, logout } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

if (!user) {
  return <LoginForm />;
}
```

### 3. Gestionarea Erorilor

**Hook-ul useErrorHandler** (`src/hooks/useErrorHandler.ts`)

```typescript
const { error, isLoading, handleAsyncOperation, clearError } =
  useErrorHandler();

// Gestionează operațiuni async cu erori automat
const result = await handleAsyncOperation(async () => {
  return await fetchData();
}, "network");
```

**Componenta ErrorDisplay** (`src/components/common/ErrorDisplay.tsx`)

```typescript
// Afișează erorile într-un mod prietenos
<ErrorDisplay error={error} onClose={clearError} />
```

### 4. Tipuri TypeScript

**Tipuri pentru Utilizatori** (`src/types/user.ts`)

```typescript
// Tipul de cont
type AccountType = "producer" | "artist" | "studio";

// Interfața pentru utilizator
interface AppUser {
  id: string;
  name: string;
  email: string;
  accountType: AccountType;
  rating: number;
  // ... alte proprietăți
}
```

## 🚀 Cum să Începi

### 1. Instalarea Dependințelor

```bash
npm install
```

### 2. Configurarea Firebase

- Creează un proiect Firebase
- Copiază configurația în `src/firebase.ts`
- Activează Authentication și Firestore

### 3. Rularea Aplicației

```bash
npm run dev
```

## 📝 Convenții de Cod

### 1. Numele Componentelor

- Folosește PascalCase pentru componente: `UserProfile`, `RatingModal`
- Folosește camelCase pentru funcții: `handleSubmit`, `getUserData`

### 2. Comentarii

- Adaugă comentarii explicative în română pentru juniori
- Documentează funcțiile complexe cu JSDoc
- Explică logica de business în comentarii

### 3. Gestionarea Erorilor

- Folosește întotdeauna `try-catch` pentru operațiuni async
- Afișează mesaje prietenoase utilizatorului
- Loghează erorile pentru debugging

### 4. Stilizare

- Folosește Tailwind CSS pentru stilizare
- Păstrează consistența în design
- Folosește clase responsive

## 🔧 Instrumente de Dezvoltare

### 1. ESLint

```bash
npm run lint
```

### 2. TypeScript

- Verifică tipurile în timp real
- Folosește tipuri stricte
- Evită `any` când este posibil

### 3. React DevTools

- Instalează extensia pentru browser
- Folosește pentru debugging componentelor

## 🐛 Debugging pentru Juniori

### 1. Console.log

```typescript
console.log("Valoarea variabilei:", variable);
console.warn("Atenție:", warningMessage);
console.error("Eroare:", errorMessage);
```

### 2. React DevTools

- Inspecționează props-urile componentelor
- Verifică starea componentelor
- Urmărește re-render-urile

### 3. Network Tab

- Verifică request-urile către API
- Verifică răspunsurile de la server
- Identifică erorile de rețea

## 📚 Resurse Utile

### 1. Documentația React

- [React Docs](https://react.dev/)
- [React Hooks](https://react.dev/reference/react)

### 2. TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React + TypeScript](https://react-typescript-cheatsheet.netlify.app/)

### 3. Firebase

- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore](https://firebase.google.com/docs/firestore)

### 4. Tailwind CSS

- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com/)

## 🤝 Contribuții

### 1. Pull Requests

- Creează branch-uri descriptive
- Adaugă comentarii explicative
- Testează modificările

### 2. Code Review

- Verifică codul pentru erori
- Sugerează îmbunătățiri
- Păstrează tonul constructiv

### 3. Documentație

- Actualizează README-ul când este necesar
- Documentează funcțiile noi
- Explică deciziile de design

## ❓ Întrebări Frecvente

### Q: Cum adaug o nouă pagină?

A: Creează componenta în `src/pages/` și adaugă ruta în `App.tsx`.

### Q: Cum gestionez erorile?

A: Folosește hook-ul `useErrorHandler` și componenta `ErrorDisplay`.

### Q: Cum adaug un nou tip de utilizator?

A: Modifică tipul `AccountType` în `src/types/user.ts`.

### Q: Cum stilizez o componentă?

A: Folosește clasele Tailwind CSS și păstrează consistența.

---

**Notă pentru Seniori**: Acest ghid este destinat dezvoltatorilor juniori. Dacă observi zone care pot fi îmbunătățite sau simplificate, te rugăm să contribui cu sugestii constructive.
