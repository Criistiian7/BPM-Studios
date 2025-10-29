import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/authContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useAlert } from "../hooks/useAlert";
import { StudioCard } from "../components/ArtistStudios/StudioCard";
import { StudioMembers } from "../components/ArtistStudios/StudioMembers";
import { StudioTracks } from "../components/ArtistStudios/StudioTracks";
import type { Studio as StudioType } from "../types/studio";
import type { Track } from "../types/track";
import type { UserProfile } from "../types/user";
import { SPECIAL_USERS, ACCOUNT_TYPES } from "../constants";

/**
 * Hook pentru gestionarea studio-urilor artistului
 * Separă logica de business de componenta UI
 */
const useArtistStudios = () => {
  const { user } = useAuth();
  const { showError } = useAlert();

  const [studios, setStudios] = useState<StudioType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudio, setSelectedStudio] = useState<StudioType | null>(null);
  const [studioTracks, setStudioTracks] = useState<Track[]>([]);
  const [studioMembers, setStudioMembers] = useState<UserProfile[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  /**
   * Adaugă utilizatorul curent la studio-urile unde ID-ul corect este membru
   */
  const addUserToCorrectStudios = useCallback(async () => {
    if (!user || user.id === SPECIAL_USERS.CORRECT_ID) {
      return;
    }

    try {
      const studiosRef = collection(db, "studios");
      const allStudiosSnapshot = await getDocs(studiosRef);

      const studiosWithCorrectId = allStudiosSnapshot.docs.filter(doc => {
        const memberIds = doc.data().memberIds || [];
        return memberIds.includes(SPECIAL_USERS.CORRECT_ID);
      });

      for (const studioDoc of studiosWithCorrectId) {
        const studioData = studioDoc.data();
        const currentMembers = studioData.memberIds || [];

        if (!currentMembers.includes(user.id)) {
          const studioRef = doc(db, "studios", studioDoc.id);
          await updateDoc(studioRef, {
            memberIds: [...currentMembers, user.id],
            updatedAt: serverTimestamp(),
          });
        }
      }
    } catch (error) {
      console.error("Eroare la adăugarea utilizatorului la studio-uri:", error);
      showError("Eroare la actualizarea membrilor studio-ului");
    }
  }, [user, showError]);

  /**
   * Încarcă studio-urile artistului
   */
  useEffect(() => {
    if (!user || (user.accountType !== ACCOUNT_TYPES.ARTIST && user.accountType !== ACCOUNT_TYPES.ARTIST_CAPITAL)) {
      setStudios([]);
      setLoading(false);
      return;
    }

    const studiosRef = collection(db, "studios");
    const studiosQuery = query(studiosRef, where("memberIds", "array-contains", user.id));

    const unsubscribeStudios = onSnapshot(studiosQuery, async (snapshot) => {
      try {
        const studiosData: StudioType[] = [];

        for (const studioDoc of snapshot.docs) {
          const studioData = studioDoc.data();
          const ownerRef = doc(db, "users", studioData.ownerId);
          const ownerSnapshot = await getDoc(ownerRef);

          studiosData.push({
            id: studioDoc.id,
            ...studioData,
            ownerName: ownerSnapshot.exists() ? ownerSnapshot.data().displayName : "Unknown",
          } as StudioType);
        }

        setStudios(studiosData);
        setLoading(false);
      } catch (error) {
        console.error("Eroare la listener-ul pentru studio-uri:", error);
        showError("Eroare la încărcarea studio-urilor");
        setLoading(false);
      }
    }, (error) => {
      console.error("Eroare la listener-ul pentru studio-uri:", error);
      showError("Eroare la încărcarea studio-urilor");
      setLoading(false);
    });

    // Adaugă utilizatorul la studio-urile unde ID-ul corect este membru
    addUserToCorrectStudios();

    return () => {
      unsubscribeStudios();
    };
  }, [user, showError, addUserToCorrectStudios]);

  /**
   * Încarcă detaliile unui studio selectat
   */
  useEffect(() => {
    if (!selectedStudio) {
      setStudioTracks([]);
      setStudioMembers([]);
      return;
    }

    setLoadingDetails(true);

    // Listener pentru tracks
    const tracksRef = collection(db, "tracks");
    const tracksQuery = query(tracksRef, where("studioId", "==", selectedStudio.id));

    const unsubscribeTracks = onSnapshot(tracksQuery, (snapshot) => {
      const tracksData: Track[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Track));
      setStudioTracks(tracksData);
    });

    // Încarcă membrii
    const loadMembers = async () => {
      try {
        const memberPromises = (selectedStudio.memberIds || []).map(async (memberId: string) => {
          const memberRef = doc(db, "users", memberId);
          const memberSnapshot = await getDoc(memberRef);

          if (memberSnapshot.exists()) {
            return {
              uid: memberId,
              ...memberSnapshot.data()
            } as UserProfile;
          }
          return null;
        });

        const members = (await Promise.all(memberPromises)).filter(Boolean) as UserProfile[];
        setStudioMembers(members);
      } catch (error) {
        console.error("Eroare la încărcarea membrilor:", error);
        showError("Eroare la încărcarea membrilor");
      } finally {
        setLoadingDetails(false);
      }
    };

    loadMembers();

    return () => {
      unsubscribeTracks();
    };
  }, [selectedStudio, showError]);

  return {
    studios,
    loading,
    selectedStudio,
    studioTracks,
    studioMembers,
    loadingDetails,
    setSelectedStudio,
  };
};

/**
 * Pagina ArtistStudios - Afișează studio-urile la care artistul este membru
 * Refactorizată pentru a respecta principiul KISS cu componente mai mici
 */
const ArtistStudios: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    studios,
    loading,
    selectedStudio,
    studioTracks,
    studioMembers,
    loadingDetails,
    setSelectedStudio,
  } = useArtistStudios();

  // Verifică accesul
  if (authLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user || (user.accountType !== ACCOUNT_TYPES.ARTIST && user.accountType !== ACCOUNT_TYPES.ARTIST_CAPITAL)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acces Restricționat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Această pagină este disponibilă doar pentru artiști.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Studiourile Mele
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Studio-urile la care ești membru și poți colabora cu alți artiști
          </p>
        </div>

        {/* Main Content */}
        <div className="xl:grid xl:grid-cols-2 xl:gap-8 space-y-8 xl:space-y-0">
          {/* Left Side - Studio List */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Studio-urile Tale ({studios.length})
            </h2>

            {studios.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nu ești membru la niciun studio
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Explorează comunitatea pentru a găsi studio-uri la care să te alături.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {studios.map((studio) => (
                  <StudioCard
                    key={studio.id}
                    studio={studio}
                    isSelected={selectedStudio?.id === studio.id}
                    memberCount={selectedStudio?.id === studio.id ? studioMembers.length : (studio.memberIds?.length || 0)}
                    trackCount={selectedStudio?.id === studio.id ? studioTracks.length : (studio.trackCount || 0)}
                    onClick={() => setSelectedStudio(studio)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Studio Details */}
          {selectedStudio && (
            <div className="space-y-6">
              <StudioMembers
                members={studioMembers}
                loading={loadingDetails}
              />
              <StudioTracks
                tracks={studioTracks}
                studioName={selectedStudio.name}
                loading={loadingDetails}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistStudios;