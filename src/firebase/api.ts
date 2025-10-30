import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  increment,
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
  ownerName?: string; // Name of the owner (artist/producer)
  description?: string;
  status?: "Work in Progress" | "Pre-Release" | "Release";
  genre?: string;
  bpm?: number;
  fileUrl?: string; // backward-compat name
  audioURL?: string; // preferred name
  collaborators?: string[]; // Array of user IDs
  uploadedByStudio?: boolean; // Flag if uploaded by studio
  studioName?: string; // Studio name if uploaded by studio
  studioId?: string; // Studio ID if uploaded by studio
};

export async function createTrackFirestore(payload: CreateTrackPayload) {
  const docPayload = {
    title: payload.title,
    ownerId: payload.ownerId,
    ownerName: payload.ownerName ?? null,
    description: payload.description ?? "",
    status: payload.status ?? "Work in Progress",
    genre: payload.genre ?? "",
    bpm: payload.bpm ?? null,
    audioURL: payload.audioURL ?? payload.fileUrl ?? "",
    collaborators: payload.collaborators ?? [],
    uploadedByStudio: payload.uploadedByStudio ?? false,
    studioName: payload.studioName ?? null,
    studioId: payload.studioId ?? null,
    createdAt: serverTimestamp(),
  };

  // Adaugă track-ul în colecția "tracks"
  const ref = await addDoc(collection(db, "tracks"), docPayload);

  // Actualizează statisticile utilizatorului
  try {
    const userRef = doc(db, "users", payload.ownerId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, {
        "statistics.tracksUploaded": increment(1),
        updatedAt: serverTimestamp(),
      });
    } else {
      console.warn("⚠️ User document not found, statistics not updated");
    }
  } catch (error) {
    console.error("Error updating user statistics:", error);
    // Nu aruncăm eroarea pentru a nu bloca upload-ul track-ului
  }

  return { id: ref.id, ...docPayload } as const;
}

export type UpdateTrackPayload = {
  title?: string;
  description?: string;
  status?: "Work in Progress" | "Pre-Release" | "Release";
  genre?: string;
  bpm?: number;
  collaborators?: string[]; // Array of user IDs
};

export async function updateTrackFirestore(
  trackId: string,
  payload: UpdateTrackPayload
) {
  const trackRef = doc(db, "tracks", trackId);
  await updateDoc(trackRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });

  return { id: trackId, ...payload };
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
  await deleteDoc(doc(db, "requests", requestId));
  return { succes: true };
}
