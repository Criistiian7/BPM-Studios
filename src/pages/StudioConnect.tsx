import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { useNavigate } from "react-router-dom";
import type { Studio as StudioType } from "../types/studio";
import type { Track } from "../types/track";
import type { UserProfile } from "../types/user";
import { SPECIAL_USERS } from "../constants";
import { normalizeAccountType } from "../utils/formatters";
import { FiHome } from "react-icons/fi";
import { slugify } from "../utils/slugify";

/**
 * Hook pentru gestionarea studio-urilor
 * Funcționează pentru atât Artiști cât și Producători
 */
const useStudioConnect = () => {
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
     * Încarcă studio-urile:
     * - Pentru producători: TOATE studio-urile pentru colaborare
     * - Pentru artiști: studio-urile la care este membru
     */
    useEffect(() => {
        if (!user) {
            setStudios([]);
            setLoading(false);
            return;
        }

        const normalizedAccountType = normalizeAccountType(user.accountType);

        // Pentru producători - încarcă TOATE studio-urile pentru colaborare
        if (normalizedAccountType === "producer") {
            const studiosRef = collection(db, "studios");

            const unsubscribeStudios = onSnapshot(
                studiosRef,
                async (snapshot) => {
                    try {
                        const studiosData: StudioType[] = [];

                        for (const studioDoc of snapshot.docs) {
                            const studioData = studioDoc.data();

                            // Încarcă owner name
                            let ownerName = "Owner";
                            if (studioData.ownerId) {
                                try {
                                    const ownerRef = doc(db, "users", studioData.ownerId);
                                    const ownerSnapshot = await getDoc(ownerRef);
                                    if (ownerSnapshot.exists()) {
                                        ownerName = ownerSnapshot.data().displayName || ownerSnapshot.data().name || "Owner";
                                    }
                                } catch (error) {
                                    console.error("Error loading owner name:", error);
                                }
                            }

                            studiosData.push({
                                id: studioDoc.id,
                                ...studioData,
                                ownerName,
                            } as StudioType);
                        }


                        setStudios(studiosData);
                    } catch (error) {
                        console.error("Eroare la listener-ul pentru studio-uri:", error);
                        showError("Eroare la încărcarea studio-urilor");
                    } finally {
                        setLoading(false);
                    }
                },
                (error) => {
                    console.error("Eroare la listener-ul pentru studio-uri:", error);
                    showError("Eroare la încărcarea studio-urilor");
                    setLoading(false);
                }
            );

            return () => {
                unsubscribeStudios();
            };
        }

        // Pentru artiști - încarcă studio-urile la care este membru
        if (normalizedAccountType === "artist") {
            const studiosRef = collection(db, "studios");
            const studiosQuery = query(studiosRef, where("memberIds", "array-contains", user.id));

            const unsubscribeStudios = onSnapshot(
                studiosQuery,
                async (snapshot) => {
                    try {

                        const studiosData: StudioType[] = [];

                        for (const studioDoc of snapshot.docs) {
                            const studioData = studioDoc.data();

                            // Verifică explicit dacă user.id este în memberIds (pentru debugging)
                            const memberIds = studioData.memberIds || [];

                            if (!memberIds.includes(user.id)) {
                                continue;
                            }

                            // Încarcă owner name
                            let ownerName = "Owner";
                            if (studioData.ownerId) {
                                try {
                                    const ownerRef = doc(db, "users", studioData.ownerId);
                                    const ownerSnapshot = await getDoc(ownerRef);
                                    if (ownerSnapshot.exists()) {
                                        ownerName = ownerSnapshot.data().displayName || ownerSnapshot.data().name || "Owner";
                                    }
                                } catch (error) {
                                    console.error("Error loading owner name:", error);
                                }
                            }

                            studiosData.push({
                                id: studioDoc.id,
                                ...studioData,
                                ownerName,
                            } as StudioType);

                        }


                        setStudios(studiosData);
                    } catch (error) {
                        console.error("Eroare la listener-ul pentru studio-uri:", error);
                        showError("Eroare la încărcarea studio-urilor");
                    } finally {
                        setLoading(false);
                    }
                },
                (error) => {
                    console.error("Eroare la listener-ul pentru studio-uri:", error);
                    showError("Eroare la încărcarea studio-urilor");
                    setLoading(false);
                }
            );

            // Verifică suplimentar connectionRequests acceptate pentru a sincroniza cu memberIds
            const checkAcceptedRequests = async () => {
                try {
                    const requestsRef = collection(db, "connectionRequests");
                    const acceptedRequestsQuery = query(
                        requestsRef,
                        where("senderId", "==", user.id),
                        where("requestType", "==", "studio_join"),
                        where("status", "==", "accepted")
                    );
                    const requestsSnapshot = await getDocs(acceptedRequestsQuery);



                    for (const requestDoc of requestsSnapshot.docs) {
                        const requestData = requestDoc.data();
                        const studioId = requestData.studioId;


                        if (studioId) {
                            const studioRef = doc(db, "studios", studioId);
                            const studioDoc = await getDoc(studioRef);

                            if (studioDoc.exists()) {
                                const studioData = studioDoc.data();
                                const currentMembers = studioData.memberIds || [];

                                if (!currentMembers.includes(user.id)) {
                                    await updateDoc(studioRef, {
                                        memberIds: [...currentMembers, user.id],
                                        updatedAt: serverTimestamp(),
                                    });
                                }
                            } else {

                            }
                        }
                    }
                } catch (error) {
                    console.error("Error checking accepted requests:", error);
                }
            };

            checkAcceptedRequests();
            addUserToCorrectStudios();

            return () => {
                unsubscribeStudios();
            };
        }

        // Pentru alte tipuri de cont sau fallback
        setStudios([]);
        setLoading(false);
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

        const unsubscribeTracks = onSnapshot(
            tracksQuery,
            (snapshot) => {
                const tracksData: Track[] = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Track[];
                setStudioTracks(tracksData);
                setLoadingDetails(false);
            },
            (error) => {
                console.error("Error loading tracks:", error);
                setLoadingDetails(false);
            }
        );

        // Încarcă membrii
        const loadMembers = async () => {
            try {
                if (!selectedStudio.memberIds || selectedStudio.memberIds.length === 0) {
                    setStudioMembers([]);
                    return;
                }

                const memberPromises = selectedStudio.memberIds.map(async (memberId: string) => {
                    const memberRef = doc(db, "users", memberId);
                    const memberSnapshot = await getDoc(memberRef);

                    if (memberSnapshot.exists()) {
                        return {
                            uid: memberId,
                            ...memberSnapshot.data(),
                        } as UserProfile;
                    }
                    return null;
                });

                const members = (await Promise.all(memberPromises)).filter(Boolean) as UserProfile[];
                setStudioMembers(members);
            } catch (error) {
                console.error("Eroare la încărcarea membrilor:", error);
                showError("Eroare la încărcarea membrilor");
            }
        };

        loadMembers();

        // Reîncarcă membrii când selectedStudio.memberIds se schimbă
        const unsubscribeStudio = onSnapshot(
            doc(db, "studios", selectedStudio.id),
            (studioSnap) => {
                if (studioSnap.exists()) {
                    const studioData = studioSnap.data();
                    const newMemberIds = studioData.memberIds || [];

                    if (JSON.stringify(newMemberIds) !== JSON.stringify(selectedStudio.memberIds)) {
                        loadMembers();
                    }
                }
            },
            (error) => {
                console.error("Error listening to studio changes:", error);
            }
        );

        return () => {
            unsubscribeTracks();
            unsubscribeStudio();
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
 * Pagina StudioConnect - Pagină unificată pentru studiouri
 * Disponibilă pentru atât Artiști cât și Producători
 */
const StudioConnect: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const {
        studios,
        loading,
        selectedStudio,
        studioTracks,
        studioMembers,
        loadingDetails,
        setSelectedStudio,
    } = useStudioConnect();

    // Track counts per studio (real-time) pentru carduri
    const [studioTrackCounts, setStudioTrackCounts] = useState<Record<string, number>>({});
    const trackUnsubsRef = useRef<Record<string, () => void>>({});

    // Creează/actualizează listener-ele pentru fiecare studio din listă
    useEffect(() => {
        // Cleanup pentru listener-ele care nu mai sunt necesare
        const currentIds = new Set(studios.map(s => s.id));
        Object.keys(trackUnsubsRef.current).forEach((id) => {
            if (!currentIds.has(id)) {
                try { trackUnsubsRef.current[id]?.(); } catch { /* ignore */ }
                delete trackUnsubsRef.current[id];
            }
        });

        // Adaugă listener pentru fiecare studio fără unsubscribe activ
        studios.forEach((s) => {
            if (trackUnsubsRef.current[s.id]) return;
            const tracksRef = collection(db, "tracks");
            const q = query(tracksRef, where("studioId", "==", s.id));
            const unsub = onSnapshot(q, (snap) => {
                setStudioTrackCounts((prev) => ({ ...prev, [s.id]: snap.size }));
            });
            trackUnsubsRef.current[s.id] = unsub;
        });

        return () => {
            // Notă: nu facem cleanup complet aici ca să păstrăm listener-ele cât timp componenta e montată;
            // cleanup-ul per-id se face la schimbarea listei și la demontare mai jos
        };
    }, [studios]);

    // Cleanup total la demontare
    useEffect(() => {
        return () => {
            Object.values(trackUnsubsRef.current).forEach((unsub) => {
                try { unsub(); } catch { /* ignore */ }
            });
            trackUnsubsRef.current = {};
        };
    }, []);

    // Verifică accesul
    if (authLoading) {
        return <LoadingSpinner fullScreen />;
    }

    // Toate Hooks-urile trebuie să fie apelate înainte de orice return condițional
    const normalizedAccountType = user ? normalizeAccountType(user.accountType) : "artist";
    const isProducerUser = normalizedAccountType === "producer";
    const isArtistUser = normalizedAccountType === "artist";

    // Pentru producători - verifică dacă are propriul studio
    const producerOwnStudio = isProducerUser && user
        ? studios.find(s => s.ownerId === user.id)
        : null;

    // Pentru producători - auto-select propriul studio dacă există
    // IMPORTANT: Acest useEffect trebuie să fie apelat înainte de orice return condițional
    useEffect(() => {
        if (isProducerUser && producerOwnStudio && !selectedStudio) {
            setSelectedStudio(producerOwnStudio);
        }
    }, [isProducerUser, producerOwnStudio, selectedStudio, setSelectedStudio]);

    // Verificări de acces - după toate Hooks-urile
    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Acces Restricționat
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Trebuie să fii autentificat pentru a accesa această pagină.
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
                        Studio Connect
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isProducerUser
                            ? "Explorează și colaborează cu alte studio-uri și artiști"
                            : "Studio-urile la care ești membru și poți colabora cu alți artiști"}
                    </p>
                    {isProducerUser && !producerOwnStudio && (
                        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                💡 Nu ai încă propriul studio.{" "}
                                <button
                                    onClick={() => navigate("/studio")}
                                    className="font-semibold underline hover:text-blue-900 dark:hover:text-blue-200"
                                >
                                    Creează-ți propriul studio
                                </button>{" "}
                                pentru a gestiona tracks, membri și setări.
                            </p>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="xl:grid xl:grid-cols-3 xl:gap-8 space-y-8 xl:space-y-0">
                    {/* Left Side - Studio List (pentru artiști și producători) */}
                    {(isArtistUser || isProducerUser) && (
                        <div className="space-y-6 xl:col-span-1">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {isProducerUser
                                    ? "Studio-uri Disponibile"
                                    : "Studio-urile Tale"}{" "}
                                ({studios.length})
                            </h2>

                            {studios.length === 0 ? (
                                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4">
                                        <FiHome className="w-full h-full" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        {isProducerUser
                                            ? "Nu există studio-uri disponibile"
                                            : "Nu ești membru la niciun studio"}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        {isProducerUser
                                            ? "Creează-ți propriul studio sau explorează comunitatea."
                                            : "Explorează comunitatea pentru a găsi studio-uri la care să te alături."}
                                    </p>
                                    {isProducerUser ? (
                                        <button
                                            onClick={() => navigate("/studio")}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Creează Studio
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate("/community")}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Explorează Comunitatea
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {studios.map((studio) => {
                                        // Pentru producători, evidențiem propriul studio
                                        const isOwnStudio = isProducerUser && studio.ownerId === user.id;

                                        return (
                                            <div key={studio.id} className="relative transform origin-top-left scale-[0.95]">
                                                {isOwnStudio && (
                                                    <div className="absolute top-3 right-3 z-10 pointer-events-none">
                                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-semibold bg-emerald-600 text-white shadow ring-1 ring-white/20 whitespace-nowrap">
                                                            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293A1 1 0 106.293 10.707l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span>Propriul tău studio</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <StudioCard
                                                    studio={studio}
                                                    isSelected={selectedStudio?.id === studio.id}
                                                    memberCount={
                                                        selectedStudio?.id === studio.id
                                                            ? studioMembers.length
                                                            : studio.memberIds?.length || 0
                                                    }
                                                    trackCount={studioTrackCounts[studio.id] ?? studio.trackCount ?? 0}
                                                    onClick={() => setSelectedStudio(studio)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right Side - Studio Details */}
                    {selectedStudio && (
                        <div className="space-y-6 xl:col-span-2">
                            {isProducerUser && selectedStudio.ownerId === user.id && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        💡 Acesta este studio-ul tău. Poți gestiona tracks, membri și setări din{" "}
                                        <button
                                            onClick={() => navigate("/studio")}
                                            className="font-semibold underline hover:text-blue-900 dark:hover:text-blue-200"
                                        >
                                            pagina Studio
                                        </button>
                                        .
                                    </p>
                                </div>
                            )}
                            {isProducerUser && selectedStudio.ownerId !== user.id && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mb-4">
                                    <p className="text-sm text-indigo-800 dark:text-indigo-300">
                                        🎵 Explorează acest studio pentru a colabora cu membrii și tracks-urile sale.
                                    </p>
                                </div>
                            )}
                            <StudioMembers
                                members={studioMembers}
                                loading={loadingDetails}
                                onMemberClick={(member) => {
                                    const slug = member.slug || `${slugify(member.displayName || 'user')}-${member.uid.substring(0, 6)}`;
                                    navigate(`/profile/${slug}`);
                                }}
                            />
                            <StudioTracks
                                tracks={studioTracks}
                                studioName={selectedStudio.name}
                                studioId={selectedStudio.id}
                                currentUserId={user.id}
                                currentUserName={user.name}
                                loading={loadingDetails}
                            />
                        </div>
                    )}

                    {/* Pentru utilizatori fără studio selectat dar cu studio-uri în listă */}
                    {(isProducerUser || isArtistUser) && studios.length > 0 && !selectedStudio && (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">
                                Se încarcă detaliile studio-ului...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudioConnect;
