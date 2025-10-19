# 👥 Sistem de Colaborare

Cum funcționează colaborarea între users în BPM Studios.

---

## 🎯 Features

1. **Connection Requests** - Trimite cereri de conexiune
2. **Accept/Reject** - Gestionează cererile primite
3. **My Contacts** - Lista de conexiuni active
4. **Colaboratori pe Tracks** - Adaugă colaboratori la tracks

---

## 📝 Cum Funcționează

### **1. Trimite Connection Request:**

```typescript
// User A trimite cerere către User B
await addDoc(collection(db, "connectionRequests"), {
  from: userA.id,
  to: userB.id,
  fromName: userA.name,
  status: "pending",
  createdAt: new Date().toISOString(),
});
```

### **2. Accept Request:**

```typescript
// User B acceptă cererea
// 1. Creează conexiune în ambele direcții
await addDoc(collection(db, "connections"), {
  userId: userA.id,
  connectedUserId: userB.id,
  createdAt: new Date().toISOString(),
});

// 2. Șterge request-ul
await deleteDoc(doc(db, "connectionRequests", requestId));
```

### **3. Browse Contacts:**

```typescript
// Afișează toate conexiunile user-ului
const q = query(
  collection(db, "connections"),
  where("userId", "==", currentUserId)
);
const snapshot = await getDocs(q);
```

---

## 🎵 Colaboratori pe Tracks

**Când upload-ezi un track, poți selecta colaboratori din contacts.**

**Beneficii:**

- Tracks apar pe profilul tuturor colaboratorilor
- Credit pentru toată lumea
- Networking mai bun

---

## 📊 Collections Firestore

```
connectionRequests/
  ├── {requestId}
      ├── from: userId
      ├── to: userId
      ├── fromName: string
      ├── status: "pending"
      └── createdAt: timestamp

connections/
  ├── {connectionId}
      ├── userId: string
      ├── connectedUserId: string
      └── createdAt: timestamp
```

---

## 🔧 Fișiere Importante

- `src/pages/Dashboard/ConnectionRequests.tsx` - Gestionare cereri
- `src/pages/Dashboard/MyContacts.tsx` - Lista contacte
- `src/components/community.tsx` - Trimite cereri

---

## 🎓 Concepte Învățate

- Firestore relationships (connections între users)
- Query filtering cu `where`
- Real-time listeners cu `onSnapshot`
- CRUD operations (Create, Read, Update, Delete)

---

**👥 Sistem complet de networking implementat!**
