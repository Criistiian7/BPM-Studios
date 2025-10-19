import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

export interface TrackRating {
  trackId: string;
  userId: string;
  userName: string;
  trackOwnerId: string;
  rating: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/**
 * Salvează sau actualizează rating-ul unui track
 */
export async function saveTrackRating(
  trackId: string,
  userId: string,
  userName: string,
  trackOwnerId: string,
  rating: number
): Promise<void> {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating-ul trebuie să fie între 1 și 5");
  }

  if (userId === trackOwnerId) {
    throw new Error("Nu poți da rating propriilor track-uri");
  }

  const ratingId = `${trackId}_${userId}`;
  const ratingRef = doc(db, "trackRatings", ratingId);

  const existingRating = await getDoc(ratingRef);

  const ratingData: any = {
    trackId,
    userId,
    userName,
    trackOwnerId,
    rating,
    updatedAt: serverTimestamp(),
  };

  if (!existingRating.exists()) {
    ratingData.createdAt = serverTimestamp();
  }

  await setDoc(ratingRef, ratingData, { merge: true });

  // Actualizează rating-ul mediu al track-ului
  await updateTrackAverageRating(trackId);

  // Actualizează rating-ul profilului owner-ului
  await updateUserProfileRating(trackOwnerId);

  // Actualizează rating-ul studio-urilor owner-ului (dacă există)
  await updateStudioRatingsForOwner(trackOwnerId);
}

/**
 * Obține rating-ul unui utilizator pentru un track specific
 */
export async function getUserTrackRating(
  trackId: string,
  userId: string
): Promise<number> {
  const ratingId = `${trackId}_${userId}`;
  const ratingRef = doc(db, "trackRatings", ratingId);
  const ratingDoc = await getDoc(ratingRef);

  if (ratingDoc.exists()) {
    return ratingDoc.data().rating;
  }

  return 0;
}

/**
 * Calculează și actualizează rating-ul mediu al unui track
 */
export async function updateTrackAverageRating(trackId: string): Promise<void> {
  const ratingsRef = collection(db, "trackRatings");
  const q = query(ratingsRef, where("trackId", "==", trackId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    // Dacă nu există rating-uri, setează rating-ul la 0
    const trackRef = doc(db, "tracks", trackId);
    await updateDoc(trackRef, {
      rating: 0,
      ratingCount: 0,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  let totalRating = 0;
  snapshot.forEach((doc) => {
    totalRating += doc.data().rating;
  });

  const averageRating = totalRating / snapshot.size;
  const trackRef = doc(db, "tracks", trackId);

  await updateDoc(trackRef, {
    rating: parseFloat(averageRating.toFixed(2)),
    ratingCount: snapshot.size,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Calculează și actualizează rating-ul de profil al unui utilizator
 * (media rating-urilor tuturor track-urilor utilizatorului)
 */
export async function updateUserProfileRating(userId: string): Promise<void> {
  // Obține toate track-urile utilizatorului
  const tracksRef = collection(db, "tracks");
  const tracksQuery = query(tracksRef, where("ownerId", "==", userId));
  const tracksSnapshot = await getDocs(tracksQuery);

  if (tracksSnapshot.empty) {
    return;
  }

  let totalRating = 0;
  let tracksWithRatings = 0;

  tracksSnapshot.forEach((doc) => {
    const trackData = doc.data();
    if (trackData.rating && trackData.rating > 0) {
      totalRating += trackData.rating;
      tracksWithRatings++;
    }
  });

  // Calculează media
  const profileRating =
    tracksWithRatings > 0 ? totalRating / tracksWithRatings : 0;

  // Actualizează rating-ul de profil în users collection
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    rating: parseFloat(profileRating.toFixed(2)),
    updatedAt: serverTimestamp(),
  });

  console.log(
    `✅ Profile rating updated for user ${userId}: ${profileRating.toFixed(2)}`
  );
}

/**
 * Actualizează rating-ul tuturor studio-urilor deținute de un utilizator
 * (rating-ul studio-ului = rating-ul profilului owner-ului)
 */
export async function updateStudioRatingsForOwner(
  ownerId: string
): Promise<void> {
  try {
    // Găsește toate studio-urile owner-ului
    const studiosRef = collection(db, "studios");
    const studiosQuery = query(studiosRef, where("ownerId", "==", ownerId));
    const studiosSnapshot = await getDocs(studiosQuery);

    if (studiosSnapshot.empty) {
      console.log(`No studios found for owner ${ownerId}`);
      return;
    }

    // Obține rating-ul owner-ului din users
    const userRef = doc(db, "users", ownerId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.warn(`User ${ownerId} not found`);
      return;
    }

    const ownerRating = userDoc.data().rating || 0;

    // Actualizează rating-ul pentru fiecare studio
    const updatePromises = studiosSnapshot.docs.map(async (studioDoc) => {
      const studioRef = doc(db, "studios", studioDoc.id);
      await updateDoc(studioRef, {
        rating: parseFloat(ownerRating.toFixed(2)),
        updatedAt: serverTimestamp(),
      });
      console.log(
        `✅ Studio ${studioDoc.id} rating updated to ${ownerRating.toFixed(2)}`
      );
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error(`Error updating studio ratings for owner ${ownerId}:`, error);
    // Nu aruncăm eroarea pentru a nu bloca salvarea rating-ului
  }
}

/**
 * Obține toate rating-urile pentru un track
 */
export async function getTrackRatings(trackId: string): Promise<TrackRating[]> {
  const ratingsRef = collection(db, "trackRatings");
  const q = query(ratingsRef, where("trackId", "==", trackId));
  const snapshot = await getDocs(q);

  const ratings: TrackRating[] = [];
  snapshot.forEach((doc) => {
    ratings.push(doc.data() as TrackRating);
  });

  return ratings;
}

/**
 * Verifică dacă utilizatorul este conectat cu owner-ul track-ului
 */
export async function isConnectedToTrackOwner(
  currentUserId: string,
  trackOwnerId: string
): Promise<boolean> {
  if (currentUserId === trackOwnerId) {
    return false; // Nu poți da rating propriilor track-uri
  }

  // Verifică dacă există conexiune în ambele direcții
  const connectionsRef = collection(db, "connections");

  // Verifică conexiunea în prima direcție
  const q1 = query(
    connectionsRef,
    where("userId", "==", currentUserId),
    where("connectedUserId", "==", trackOwnerId)
  );
  const snapshot1 = await getDocs(q1);

  if (!snapshot1.empty) {
    return true;
  }

  // Verifică conexiunea în a doua direcție
  const q2 = query(
    connectionsRef,
    where("userId", "==", trackOwnerId),
    where("connectedUserId", "==", currentUserId)
  );
  const snapshot2 = await getDocs(q2);

  return !snapshot2.empty;
}

/**
 * Listener în timp real pentru rating-urile unui track
 */
export function subscribeToTrackRatings(
  trackId: string,
  callback: (averageRating: number, ratingCount: number) => void
): () => void {
  const ratingsRef = collection(db, "trackRatings");
  const q = query(ratingsRef, where("trackId", "==", trackId));

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(0, 0);
      return;
    }

    let totalRating = 0;
    snapshot.forEach((doc) => {
      totalRating += doc.data().rating;
    });

    const averageRating = totalRating / snapshot.size;
    callback(parseFloat(averageRating.toFixed(2)), snapshot.size);
  });
}

/**
 * Listener în timp real pentru rating-ul de profil al unui utilizator
 */
export function subscribeToUserProfileRating(
  userId: string,
  callback: (rating: number) => void
): () => void {
  const userRef = doc(db, "users", userId);

  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      callback(userData.rating || 0);
    }
  });
}

/**
 * Funcție de sincronizare MANUALĂ - Sincronizează rating-urile tuturor studio-urilor
 * Folosește pentru a iniția rating-urile studio-urilor existente
 */
export async function syncAllStudioRatings(): Promise<void> {
  try {
    console.log("🔄 Starting studio ratings synchronization...");

    // Obține toate studio-urile
    const studiosRef = collection(db, "studios");
    const studiosSnapshot = await getDocs(studiosRef);

    if (studiosSnapshot.empty) {
      console.log("No studios found to sync");
      return;
    }

    console.log(`Found ${studiosSnapshot.size} studios to sync`);
    let successCount = 0;
    let errorCount = 0;

    // Pentru fiecare studio, actualizează rating-ul
    for (const studioDoc of studiosSnapshot.docs) {
      try {
        const studioData = studioDoc.data();
        const ownerId = studioData.ownerId;

        if (!ownerId) {
          console.warn(`Studio ${studioDoc.id} has no ownerId, skipping...`);
          errorCount++;
          continue;
        }

        // Obține rating-ul owner-ului
        const userRef = doc(db, "users", ownerId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          console.warn(`Owner ${ownerId} not found for studio ${studioDoc.id}`);
          errorCount++;
          continue;
        }

        const ownerRating = userDoc.data().rating || 0;

        // Actualizează rating-ul studio-ului
        const studioRef = doc(db, "studios", studioDoc.id);
        await updateDoc(studioRef, {
          rating: parseFloat(ownerRating.toFixed(2)),
          updatedAt: serverTimestamp(),
        });

        console.log(
          `✅ Studio "${studioData.name}" (${
            studioDoc.id
          }) → rating: ${ownerRating.toFixed(2)}`
        );
        successCount++;
      } catch (error) {
        console.error(`Error syncing studio ${studioDoc.id}:`, error);
        errorCount++;
      }
    }

    console.log(
      `🎉 Sync complete! Success: ${successCount}, Errors: ${errorCount}`
    );
  } catch (error) {
    console.error("Error in syncAllStudioRatings:", error);
    throw error;
  }
}
