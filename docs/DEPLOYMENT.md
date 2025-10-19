# 🚀 Deployment Guide

Cum să deploy aplicația BPM Studios.

---

## 📦 Build Production

```bash
# 1. Build aplicația
npm run build

# 2. Preview local
npm run preview

# 3. Verifică că totul funcționează
# Deschide http://localhost:4173
```

---

## 🌐 Deploy pe Netlify

### **Pas cu pas:**

1. **Creează cont pe Netlify.com**

2. **New site from Git:**

   - Connect repository GitHub
   - Selectează branch-ul

3. **Build settings:**

   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Environment variables:**

   - Adaugă Firebase config (dacă e nevoie)

5. **Deploy!**

### **Redirects:**

Creează fișier `public/_redirects`:

```
/* /index.html 200
```

Acest fișier asigură că React Router funcționează corect pe Netlify.

---

## ✅ Checklist Înainte de Deploy

- [ ] `npm run build` - funcționează fără erori
- [ ] `npm run preview` - aplicația arată bine
- [ ] Firebase config e corect
- [ ] Environment variables setate
- [ ] `_redirects` file există în `public/`

---

## 🔧 Troubleshooting

**Problema:** Page not found la refresh
**Soluție:** Verifică că ai `_redirects` file

**Problema:** Firebase errors
**Soluție:** Verifică environment variables

---

**🚀 Deployment simplu și rapid cu Netlify!**

**Timp:** ~10 minute primul deploy
