# 🎨 UI & Design

Detalii despre design și interfața aplicației.

---

## 🎯 Design System

### **Culori:**

- **Primary:** Indigo (600, 700)
- **Secondary:** Purple (500, 600)
- **Success:** Green
- **Danger:** Red
- **Gray scale** pentru text și backgrounds

### **Tailwind CSS:**

Am folosit Tailwind pentru styling rapid și consistent.

---

## 🌓 Dark Mode

**Feature:** Toggle între Light și Dark mode

**Implementare:**

```typescript
const [theme, setTheme] = useState('light');

// Salvare în localStorage
localStorage.setItem('theme', theme);

// Classes Tailwind
<div className="bg-white dark:bg-gray-800">
```

**Folosit:** În Navbar cu buton toggle

---

## 📱 Responsive Design

**Breakpoints:**

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Exemple:**

```html
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <!-- 1 coloană mobile, 2 tablet, 3 desktop -->
</div>
```

---

## ✨ Componente UI

### **LoadingSpinner:**

```typescript
<LoadingSpinner fullScreen /> // Full page
<LoadingSpinner size="sm" />  // Inline
```

### **Avatar:**

```typescript
<Avatar src={user.avatar} name={user.name} size="md" />
// Afișează avatar sau inițiale
```

### **Button:**

```typescript
<Button
  variant="primary"
  onClick={...}
>
  Save
</Button>
```

---

## 🎭 Animații

**Smooth transitions:**

- Hover effects
- Page transitions
- Modal open/close
- Scroll smooth la tracks

**Tailwind:**

```html
<button className="transition-colors hover:bg-indigo-700">
  <!-- Smooth color transition -->
</button>
```

---

## ♿ Accessibility

- Semantic HTML (button, nav, header)
- Alt text pentru imagini
- Focus states vizibile
- Keyboard navigation
- ARIA labels (unde e necesar)

---

**🎨 UI modern și accesibil implementat!**

Tehnologie: Tailwind CSS + React
