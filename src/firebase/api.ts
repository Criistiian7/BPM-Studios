import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export async function fetchTracksByOwner(ownerId: string) {
  const q = query(collection(db, "tracks"), where("ownerId", "==", ownerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createTrackFirestore(payload: {
  title: string;
  bpm: number;
  ownerId: string;
  fileUrl?: string;
}) {
  const ref = await addDoc(collection(db, "tracks"), payload);
  return { id: ref.id, ...payload };
}

export async function fetchContacts() {
  const snap = await getDocs(collection(db, "contacts"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchRequestForUser(userId: string) {
  const q = query(collection(db, "requests"), where("toUserId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function acceptRequestFirestore(requestId: string) {
  await deleteDoc(doc(db, "request", requestId));
  return { succes: true };
}
