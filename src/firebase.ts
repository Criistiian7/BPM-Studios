// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Config-ul tău de la Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBjEHvgJeCskolAxl--1gzkH-7nMDouTCE",
  authDomain: "beatplanner-b1ec8.firebaseapp.com",
  projectId: "beatplanner-b1ec8",
  storageBucket: "beatplanner-b1ec8.firebasestorage.app",
  messagingSenderId: "900260228309",
  appId: "1:900260228309:web:8779f7d22ea2d93cd7465c",
  measurementId: "G-0Z6MX7SPX1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Servicii Firebase pe care le vei folosi
export const auth = getAuth(app);
export const db = getFirestore(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
export default app;
