import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export async function fetchTracksByOwner(ownerId: string) {
  const q = query(collection(db, "tracks"), where("ownerId", "==", ownerId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export type CreateTrackPayload = {
  title: string;
  ownerId: string;
  description?: string;
  status?: "Work in Progress" | "Pre-Release" | "Release";
  genre?: string;
  bpm?: number;
  fileUrl?: string; // backward-compat name
  audioURL?: string; // preferred name
};

export async function createTrackFirestore(payload: CreateTrackPayload) {
  const docPayload = {
    title: payload.title,
    ownerId: payload.ownerId,
    description: payload.description ?? "",
    status: payload.status ?? "Work in Progress",
    genre: payload.genre ?? "",
    bpm: payload.bpm ?? null,
    audioURL: payload.audioURL ?? payload.fileUrl ?? "",
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "tracks"), docPayload);
  return { id: ref.id, ...docPayload } as const;
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
