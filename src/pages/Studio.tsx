import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { db } from "../firebase";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";
import { Navigate } from "react-router-dom";
import {
    FiMusic,
    FiUsers,
    FiEdit2,
    FiUpload,
    FiMapPin,
    FiPhone,
    FiMail,
} from "react-icons/fi";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import AudioPlayer from "../components/AudioPlayer";
import AlertModal from "../components/AlertModal";
import { useAlert } from "../hooks/useAlert";
import { Card, ActionButton, Avatar } from "../components/common/CommonComponents";
import type { Studio as StudioType } from "../types/studio";
import type { Track } from "../types/track";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ACCOUNT_TYPES } from "../constants";
import { useAsyncState } from "../hooks/useAsyncState";
import { handleFirebaseError } from "../utils/errorHandler";

/**
 * Hook pentru gestionarea studioului
 * Separă logica de business de componenta UI
 */
const useStudioManagement = () => {
    const { user } = useAuth();
    const { showError, showSuccess } = useAlert();

    const [studio, setStudio] = useState<StudioType | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [activeTab, setActiveTab] = useState<"tracks" | "members">("tracks");

    // Hook pentru operațiuni asincrone
    const { loading, execute: loadStudio } = useAsyncState<StudioType | null>(null);
    const { loading: tracksLoading, execute: loadTracks } = useAsyncState<Track[]>([]);

    /**
     * Încarcă datele studioului
     */
    const loadStudioData = async () => {
        if (!user?.id) return null;

        const studioId = user.accountType === ACCOUNT_TYPES.PRODUCER ? user.id : user.studioId;

        if (!studioId) {
            showError("Nu ai acces la niciun studio");
            return null;
        }

        try {
            const studioRef = doc(db, "studios", studioId);
                const studioSnap = await getDoc(studioRef);

            if (!studioSnap.exists()) {
                showError("Studio-ul nu a fost găsit");
                return null;
            }

            return { id: studioSnap.id, ...studioSnap.data() } as StudioType;
            } catch (error) {
            throw handleFirebaseError(error);
        }
    };

    /**
     * Încarcă track-urile studioului
     */
    const loadTracksData = async () => {
        if (!studio?.id) return [];

        try {
            const tracksRef = collection(db, "tracks");
            const tracksQuery = query(tracksRef, where("studioId", "==", studio.id));
            const tracksSnapshot = await getDocs(tracksQuery);

            return tracksSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Track));
        } catch (error) {
            throw handleFirebaseError(error);
        }
    };

    /**
     * Actualizează studio-ul
     */
    const updateStudio = async (updatedData: Partial<StudioType>) => {
        if (!studio?.id) return;

        try {
            const studioRef = doc(db, "studios", studio.id);
            await setDoc(studioRef, {
                ...updatedData,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            setStudio(prev => prev ? { ...prev, ...updatedData } : null);
            showSuccess("Studio-ul a fost actualizat cu succes!");
        } catch (error) {
            throw handleFirebaseError(error);
        }
    };

    /**
     * Încarcă datele inițiale
     */
    useEffect(() => {
        if (user?.id) {
            loadStudio(loadStudioData, (result) => {
                setStudio(result);
            });
        }
    }, [user?.id]);

    /**
     * Încarcă track-urile când studio-ul se schimbă
     */
    useEffect(() => {
        if (studio?.id) {
            loadTracks(loadTracksData, (result) => {
                setTracks(result);
            });
        }
    }, [studio?.id]);

    return {
        studio,
        tracks,
        loading,
        tracksLoading,
        activeTab,
        setActiveTab,
        updateStudio,
    };
};

/**
 * Componenta StudioHeader - header-ul studioului
 */
interface StudioHeaderProps {
    studio: StudioType;
    user: any;
    onEdit: () => void;
    onUpload: () => void;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({
    studio,
    user,
    onEdit,
    onUpload,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Avatar și Info de bază */}
                <div className="flex items-center space-x-4">
                    <Avatar
                                        src={studio.photoURL}
                        name={studio.name}
                        size="xl"
                    />
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                            {studio.name}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.accountType === ACCOUNT_TYPES.PRODUCER ? "Producător" : "Studio"}
                        </p>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 mt-2">
                            {user.accountType === ACCOUNT_TYPES.PRODUCER ? "Proprietar" : "Membru"}
                        </span>
                    </div>
                </div>

                {/* Acțiuni */}
                {user.accountType === ACCOUNT_TYPES.PRODUCER && (
                    <div className="flex space-x-3 ml-auto">
                        <ActionButton
                            onClick={onEdit}
                            icon={<FiEdit2 className="w-5 h-5" />}
                            variant="secondary"
                            size="lg"
                            title="Editează studio-ul"
                        />
                        <ActionButton
                            onClick={onUpload}
                            icon={<FiUpload className="w-5 h-5" />}
                            variant="primary"
                            size="lg"
                            title="Încarcă track nou"
                        />
                                    </div>
                                )}
                            </div>

            {/* Descriere */}
            {studio.description && (
                <div className="mt-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {studio.description}
                    </p>
                </div>
            )}

            {/* Informații de contact */}
            {(studio.location || studio.email || studio.phoneNumber) && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {studio.location && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <FiMapPin className="mr-2 flex-shrink-0" />
                            <span className="truncate">{studio.location}</span>
                                        </div>
                                    )}
                    {studio.email && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <FiMail className="mr-2 flex-shrink-0" />
                            <span className="truncate">{studio.email}</span>
                                        </div>
                                    )}
                    {studio.phoneNumber && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <FiPhone className="mr-2 flex-shrink-0" />
                            <span className="truncate">{studio.phoneNumber}</span>
                                        </div>
                                    )}
                                </div>
            )}

            {/* Social Links */}
            {(studio.socialLinks?.facebook || studio.socialLinks?.instagram || studio.socialLinks?.youtube) && (
                <div className="mt-6 flex space-x-4">
                    {studio.socialLinks?.facebook && (
                        <a
                            href={studio.socialLinks.facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                                                >
                            <FaFacebook className="w-5 h-5" />
                                                </a>
                                            )}
                    {studio.socialLinks?.instagram && (
                                                <a
                            href={studio.socialLinks.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                            className="text-gray-400 hover:text-pink-600 transition-colors"
                                                >
                            <FaInstagram className="w-5 h-5" />
                                                </a>
                                            )}
                    {studio.socialLinks?.youtube && (
                                                <a
                            href={studio.socialLinks.youtube}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                            className="text-gray-400 hover:text-red-600 transition-colors"
                                                >
                            <FaYoutube className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    </div>
    );
};

/**
 * Componenta StudioTabs - tab-urile pentru tracks și membri
 */
interface StudioTabsProps {
    activeTab: "tracks" | "members";
    onTabChange: (tab: "tracks" | "members") => void;
    tracksCount: number;
    membersCount: number;
}

const StudioTabs: React.FC<StudioTabsProps> = ({
    activeTab,
    onTabChange,
    tracksCount,
    membersCount,
}) => {
    return (
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-6">
                            <button
                onClick={() => onTabChange("tracks")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "tracks"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
            >
                <FiMusic className="w-4 h-4" />
                <span>Tracks ({tracksCount})</span>
                        </button>
                        <button
                onClick={() => onTabChange("members")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "members"
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
            >
                <FiUsers className="w-4 h-4" />
                <span>Membri ({membersCount})</span>
                        </button>
                    </div>
    );
};

/**
 * Componenta StudioTracksList - lista de tracks
 */
interface StudioTracksListProps {
    tracks: Track[];
    loading: boolean;
    studioName: string;
}

const StudioTracksList: React.FC<StudioTracksListProps> = ({
    tracks,
    loading,
    studioName,
}) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </Card>
                ))}
            </div>
        );
    }

    if (tracks.length === 0) {
        return (
            <Card>
                <div className="text-center py-12">
                    <FiMusic className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Nu există tracks
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Acest studio nu are tracks încărcate încă.
                    </p>
                                    </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {tracks.map((track) => (
                <Card key={track.id}>
                                            {track.audioURL && (
                                                <AudioPlayer
                                                    audioURL={track.audioURL}
                                                    title={track.title}
                                                    genre={track.genre}
                                                    status={track.status}
                            uploadedBy={studioName}
                                                    trackId={track.id}
                            onEdit={() => {
                                // Logic pentru editare track
                            }}
                            onDelete={() => {
                                // Logic pentru ștergere track
                            }}
                        />
                    )}
                </Card>
            ))}
                                        </div>
    );
};

/**
 * Pagina Studio - Refactorizată pentru simplitate
 */
const Studio: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { alert, closeAlert } = useAlert();

    const {
        studio,
        tracks,
        loading,
        tracksLoading,
        activeTab,
        setActiveTab,
    } = useStudioManagement();

    // Verifică accesul
    if (authLoading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!user || (user.accountType !== ACCOUNT_TYPES.PRODUCER && !(user.accountType === ACCOUNT_TYPES.ARTIST && user.studioId))) {
        return <Navigate to="/profile" replace />;
    }

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!studio) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Studio-ul nu a fost găsit
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Nu ai acces la acest studio sau studio-ul nu există.
                    </p>
                                </div>
                            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <StudioHeader
                    studio={studio}
                    user={user}
                    onEdit={() => {
                        // TODO: Implement edit functionality
                    }}
                    onUpload={() => {
                        // TODO: Implement upload functionality
                    }}
                />

                {/* Tabs */}
                <StudioTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    tracksCount={tracks.length}
                    membersCount={studio.memberIds?.length || 0}
                />

                {/* Content */}
                {activeTab === "tracks" ? (
                    <StudioTracksList
                        tracks={tracks}
                        loading={tracksLoading}
                        studioName={studio.name}
                    />
                ) : (
                    <Card>
                        <div className="text-center py-12">
                            <FiUsers className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Membri Studio
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                Funcționalitatea pentru membri va fi implementată în curând.
                                                </p>
                                            </div>
                    </Card>
            )}

            {/* Alert Modal */}
                {alert && (
            <AlertModal
                        isOpen={!!alert}
                onClose={closeAlert}
                title={alert.title}
                message={alert.message}
                        type={alert.type}
            />
                )}
            </div>
        </div>
    );
};

export default Studio;
