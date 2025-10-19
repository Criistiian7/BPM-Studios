# Instrucțiuni de Deploy pe Netlify

## 1. Configurare Build

Când faci deploy pe Netlify, asigură-te că ai următoarele setări:

### Build Command:
```
npm run build
```

### Publish Directory:
```
dist
```

## 2. Variabile de Mediu

În Netlify Dashboard → Site Settings → Build & Deploy → Environment Variables, adaugă toate variabilele din fișierul `.env`:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 3. Fișier _redirects

Fișierul `public/_redirects` este deja creat și va fi inclus automat în build. Acest fișier este **ESENȚIAL** pentru a preveni erorile 404 pe reload/refresh în aplicațiile React cu routing.

Conținut:
```
/*    /index.html   200
```

Acest fișier asigură că toate route-urile (ex: `/dashboard`, `/profile`, etc.) sunt redirecționate către `index.html`, permițând React Router să preia controlul.

## 4. Verificări înainte de Deploy

✅ Toate variabilele de mediu sunt setate în Netlify  
✅ Build command este `npm run build`  
✅ Publish directory este `dist`  
✅ Fișierul `_redirects` există în folderul `public/`  
✅ Aplicația funcționează corect în local (`npm run dev`)

## 5. Deploy

După ce ai configurat totul:
1. Conectează repo-ul GitHub la Netlify
2. Netlify va detecta automat că este un proiect Vite
3. Deploy automat la fiecare push pe branch-ul main

## Probleme Comune

### 404 pe refresh/reload
**Cauză**: Lipsește fișierul `_redirects`  
**Soluție**: Fișierul este deja adăugat în `public/_redirects`

### Variabile de mediu nedefinite
**Cauză**: Variabilele VITE_ nu sunt setate în Netlify  
**Soluție**: Adaugă toate variabilele din `.env` în Netlify Dashboard

### Firebase errors
**Cauză**: Configurare incorectă Firebase sau lipsă variabile  
**Soluție**: Verifică că toate variabilele VITE_FIREBASE_* sunt setate corect

