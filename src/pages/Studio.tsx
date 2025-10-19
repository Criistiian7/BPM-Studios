import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { db, storage } from "../firebase";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Navigate, useNavigate } from "react-router-dom";
import {
    FiMusic,
    FiUsers,
    FiEdit2,
    FiUpload,
    FiX,
    FiMapPin,
    FiPhone,
    FiMail,
} from "react-icons/fi";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import AudioPlayer from "../components/AudioPlayer";
import AlertModal from "../components/AlertModal";
import { useAlert } from "../hooks/useAlert";
import type { Studio as StudioType } from "../types/studio";
import type { Track } from "../types/track";
import { slugify } from "../utils/slugify";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { getInitials } from "../utils/formatters";

// Component pentru Studio Management
// Gestionează profilul studioului, tracks și membri
const Studio: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { alert, showSuccess, showError, showWarning, closeAlert } = useAlert();

    // State pentru studio
    const [studio, setStudio] = useState<StudioType | null>(null);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"tracks" | "members">("tracks");

    // State pentru Edit Studio Modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPhotoURL, setEditPhotoURL] = useState<string | null>(null);
    const [editEmail, setEditEmail] = useState("");
    const [editLocation, setEditLocation] = useState("");
    const [editPhoneNumber, setEditPhoneNumber] = useState("");
    const [editFacebook, setEditFacebook] = useState("");
    const [editInstagram, setEditInstagram] = useState("");
    const [editYoutube, setEditYoutube] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [saving, setSaving] = useState(false);

    // State pentru Upload Track Modal
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadDescription, setUploadDescription] = useState("");
    const [uploadGenre, setUploadGenre] = useState("");
    const [uploadStatus, setUploadStatus] = useState<
        "Work in Progress" | "Pre-Release" | "Release"
    >("Work in Progress");
    const [uploadAudioFile, setUploadAudioFile] = useState<File | null>(null);
    const [uploadingTrack, setUploadingTrack] = useState(false);

    // State pentru track navigation
    const [autoPlayTrackId, setAutoPlayTrackId] = useState<string | null>(null);
    const trackRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Încarcă datele studioului când componenta se montează
    useEffect(() => {
        const loadStudioData = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Încarcă studio din Firebase
                const studioRef = doc(db, "studios", user.id);
                const studioSnap = await getDoc(studioRef);

                if (studioSnap.exists()) {
                    const studioData = {
                        id: studioSnap.id,
                        ...studioSnap.data(),
                    } as StudioType;
                    setStudio(studioData);
                } else {
                    // Creează studio nou dacă nu există
                    const newStudio: Partial<StudioType> = {
                        ownerId: user.id,
                        name: `Studio ${user.name || user.email}`,
                        description: "",
                        photoURL: null,
                        memberIds: [user.id],
                        trackCount: 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    await setDoc(studioRef, newStudio);
                    setStudio({ id: user.id, ...newStudio } as StudioType);
                }

                // Încarcă tracks-urile studioului
                const tracksRef = collection(db, "tracks");
                const tracksQuery = query(tracksRef, where("userId", "==", user.id));
                const tracksSnap = await getDocs(tracksQuery);
                const tracksData: Track[] = [];
                tracksSnap.forEach((doc) => {
                    tracksData.push({ id: doc.id, ...doc.data() } as Track);
                });
                setTracks(tracksData);
            } catch (error) {
                console.error("Error loading studio:", error);
                showError("Eroare la încărcarea studioului");
            } finally {
                setLoading(false);
            }
        };

        loadStudioData();
    }, [user?.id]);

    // Reset autoPlay după 500ms
    useEffect(() => {
        if (autoPlayTrackId) {
            const timer = setTimeout(() => {
                setAutoPlayTrackId(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoPlayTrackId]);

    // Deschide Edit Modal și populează cu datele curente
    const openEditModal = () => {
        if (studio) {
            setEditName(studio.name || "");
            setEditDescription(studio.description || "");
            setEditPhotoURL(studio.photoURL || null);
            setEditEmail((studio as any).email || user?.email || "");
            setEditLocation((studio as any).location || "");
            setEditPhoneNumber((studio as any).phoneNumber || "");
            setEditFacebook((studio as any).socialLinks?.facebook || "");
            setEditInstagram((studio as any).socialLinks?.instagram || "");
            setEditYoutube((studio as any).socialLinks?.youtube || "");
            setShowEditModal(true);
        }
    };

    // Upload imagine pentru studio
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validare dimensiune (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError("Imaginea este prea mare. Maxim 5MB.");
            return;
        }

        // Validare tip
        if (!file.type.startsWith("image/")) {
            showError("Te rog selectează o imagine validă.");
            return;
        }

        setUploadingImage(true);
        try {
            // Upload la Firebase Storage
            const storageRef = ref(
                storage,
                `studios/${user.id}/${Date.now()}_${file.name}`
            );
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setEditPhotoURL(url);
            showSuccess("Imagine încărcată cu succes!");
        } catch (error) {
            console.error("Error uploading image:", error);
            showError("Eroare la încărcarea imaginii.");
        } finally {
            setUploadingImage(false);
        }
    };

    // Salvează modificările studioului
    const handleSaveStudio = async () => {
        if (!user || !studio) return;

        // Validare email
        if (editEmail.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(editEmail.trim())) {
                showError("Adresa de email nu este validă.");
                return;
            }
        }

        setSaving(true);
        try {
            const studioRef = doc(db, "studios", user.id);
            const updatedStudio: any = {
                name: editName.trim(),
                description: editDescription.trim(),
                photoURL: editPhotoURL,
                email: editEmail.trim() || null,
                location: editLocation.trim(),
                phoneNumber: editPhoneNumber.trim(),
                socialLinks: {
                    facebook: editFacebook.trim() || null,
                    instagram: editInstagram.trim() || null,
                    youtube: editYoutube.trim() || null,
                },
                updatedAt: new Date().toISOString(),
            };

            await setDoc(studioRef, updatedStudio, { merge: true });
            setStudio({ ...studio, ...updatedStudio } as StudioType);
            setShowEditModal(false);
            showSuccess("Studio-ul a fost actualizat cu succes!");
        } catch (error) {
            console.error("Error saving studio:", error);
            showError("Eroare la salvarea studioului.");
        } finally {
            setSaving(false);
        }
    };

    // Upload track nou
    const handleUploadTrack = async () => {
        if (!user || !uploadAudioFile || !uploadTitle.trim()) {
            showWarning("Te rog completează titlul și selectează un fișier audio.");
            return;
        }

        // Validare fișier audio
        if (uploadAudioFile.size > 50 * 1024 * 1024) {
            showError("Fișierul audio este prea mare. Maxim 50MB.");
            return;
        }

        setUploadingTrack(true);
        try {
            // Upload fișier la Firebase Storage
            const storageRef = ref(
                storage,
                `tracks/${user.id}/${Date.now()}_${uploadAudioFile.name}`
            );
            const snapshot = await uploadBytes(storageRef, uploadAudioFile);
            const audioURL = await getDownloadURL(snapshot.ref);

            // Creează document track în Firestore
            const trackData = {
                title: uploadTitle.trim(),
                description: uploadDescription.trim(),
                genre: uploadGenre.trim(),
                status: uploadStatus,
                audioURL,
                userId: user.id,
                ownerId: user.id,
                ownerName: user.name || user.email || "Unknown",
                uploadedByStudio: true,
                studioName: studio?.name || "",
                studioId: studio?.id || user.id,
                collaborators: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const tracksRef = collection(db, "tracks");
            await setDoc(doc(tracksRef), trackData);

            // Reîncarcă tracks
            const tracksQuery = query(tracksRef, where("userId", "==", user.id));
            const tracksSnap = await getDocs(tracksQuery);
            const tracksData: Track[] = [];
            tracksSnap.forEach((doc) => {
                tracksData.push({ id: doc.id, ...doc.data() } as Track);
            });
            setTracks(tracksData);

            // Reset form
            setUploadTitle("");
            setUploadDescription("");
            setUploadGenre("");
            setUploadStatus("Work in Progress");
            setUploadAudioFile(null);
            setShowUploadModal(false);

            showSuccess("Track-ul a fost încărcat cu succes!");
        } catch (error) {
            console.error("Error uploading track:", error);
            showError("Eroare la încărcarea track-ului.");
        } finally {
            setUploadingTrack(false);
        }
    };

    // Navigare la următorul track
    const handleNextTrack = (index: number, wasPlaying: boolean) => {
        if (index < tracks.length - 1) {
            const nextTrackId = tracks[index + 1].id;
            if (wasPlaying) {
                setAutoPlayTrackId(nextTrackId);
            }
            setTimeout(() => {
                trackRefs.current[nextTrackId]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        }
    };

    // Navigare la track-ul anterior
    const handlePreviousTrack = (index: number, wasPlaying: boolean) => {
        if (index > 0) {
            const prevTrackId = tracks[index - 1].id;
            if (wasPlaying) {
                setAutoPlayTrackId(prevTrackId);
            }
            setTimeout(() => {
                trackRefs.current[prevTrackId]?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }, 100);
        }
    };

    // Loading state
    if (authLoading || loading) {
        return <LoadingSpinner fullScreen />;
    }

    // Redirect dacă nu e autentificat
    if (!user) return <Navigate to="/auth" replace />;

    // Redirect dacă nu e producer
    if (user.accountType !== "producer") return <Navigate to="/profile" replace />;

    if (!studio) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <div className="max-w-6xl mx-auto p-6">
                {/* Studio Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
                    <div className="flex items-start justify-between gap-6">
                        {/* Avatar și Info */}
                        <div className="flex items-start gap-6 flex-1">
                            {/* Avatar Studio */}
                            <div className="flex-shrink-0">
                                {studio.photoURL ? (
                                    <img
                                        src={studio.photoURL}
                                        alt={studio.name}
                                        loading="lazy"
                                        className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700 shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                        <FiMusic className="text-3xl" />
                                    </div>
                                )}
                            </div>

                            {/* Informații Studio */}
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                    {studio.name}
                                </h1>

                                <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                    {studio.description || "Fără descriere"}
                                </p>

                                {/* Contact Info */}
                                <div className="space-y-2 mb-4">
                                    {(studio as any).location && (
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                                            <FiMapPin className="text-indigo-600 dark:text-indigo-400" />
                                            <span>{(studio as any).location}</span>
                                        </div>
                                    )}
                                    {(studio as any).phoneNumber && (
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                                            <FiPhone className="text-indigo-600 dark:text-indigo-400" />
                                            <a
                                                href={`tel:${(studio as any).phoneNumber}`}
                                                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            >
                                                {(studio as any).phoneNumber}
                                            </a>
                                        </div>
                                    )}
                                    {(studio as any).email && (
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                                            <FiMail className="text-indigo-600 dark:text-indigo-400" />
                                            <a
                                                href={`mailto:${(studio as any).email}`}
                                                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            >
                                                {(studio as any).email}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Social Media */}
                                {((studio as any).socialLinks?.facebook ||
                                    (studio as any).socialLinks?.instagram ||
                                    (studio as any).socialLinks?.youtube) && (
                                        <div className="flex items-center gap-3 mb-4">
                                            {(studio as any).socialLinks?.facebook && (
                                                <a
                                                    href={(studio as any).socialLinks.facebook}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-500 hover:text-[#1877F2] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all"
                                                    title="Facebook"
                                                >
                                                    <FaFacebook className="text-xl" />
                                                </a>
                                            )}
                                            {(studio as any).socialLinks?.instagram && (
                                                <a
                                                    href={(studio as any).socialLinks.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-500 hover:text-[#E4405F] hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-lg transition-all"
                                                    title="Instagram"
                                                >
                                                    <FaInstagram className="text-xl" />
                                                </a>
                                            )}
                                            {(studio as any).socialLinks?.youtube && (
                                                <a
                                                    href={(studio as any).socialLinks.youtube}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-gray-500 hover:text-[#FF0000] hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="YouTube"
                                                >
                                                    <FaYoutube className="text-xl" />
                                                </a>
                                            )}
                                        </div>
                                    )}

                                {/* Stats */}
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <FiUsers className="text-indigo-600 dark:text-indigo-400" />
                                        <span className="font-medium">1</span>
                                        <span className="text-gray-500 dark:text-gray-400">membru</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <FiMusic className="text-indigo-600 dark:text-indigo-400" />
                                        <span className="font-medium">{tracks.length}</span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {tracks.length === 1 ? "track" : "tracks"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Butoane Acțiuni */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="p-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                                title="Upload Track"
                            >
                                <FiUpload className="text-xl" />
                            </button>

                            <button
                                onClick={openEditModal}
                                className="p-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                title="Editează Studio"
                            >
                                <FiEdit2 className="text-xl" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs și Conținut */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab("tracks")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "tracks"
                                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FiMusic />
                                <span>Tracks ({tracks.length})</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("members")}
                            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === "members"
                                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FiUsers />
                                <span>Membri (1)</span>
                            </div>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === "tracks" ? (
                            // Tracks Tab
                            <div className="space-y-6">
                                {tracks.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <FiMusic className="mx-auto text-5xl mb-4 opacity-50" />
                                        <p className="text-lg font-medium mb-2">Nu ai track-uri încărcate</p>
                                        <p className="text-sm">Track-urile tale vor apărea aici</p>
                                    </div>
                                ) : (
                                    tracks.map((track, index) => (
                                        <div
                                            key={track.id}
                                            ref={(el) => {
                                                trackRefs.current[track.id] = el;
                                            }}
                                            className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-lg overflow-hidden"
                                        >
                                            {track.audioURL && (
                                                <AudioPlayer
                                                    audioURL={track.audioURL}
                                                    title={track.title}
                                                    genre={track.genre}
                                                    status={track.status}
                                                    uploadedBy={studio.name}
                                                    uploadedById={user.id}
                                                    trackId={track.id}
                                                    currentUserId={user.id}
                                                    currentUserName={user.name || user.email || "Unknown"}
                                                    collaborators={track.collaborators || []}
                                                    onUploadedByClick={() => {
                                                        const studioSlug = `${slugify(studio.name)}-${user.id.substring(
                                                            0,
                                                            6
                                                        )}`;
                                                        navigate(`/profile/${studioSlug}`);
                                                    }}
                                                    onNext={(wasPlaying) => handleNextTrack(index, wasPlaying)}
                                                    onPrevious={(wasPlaying) =>
                                                        handlePreviousTrack(index, wasPlaying)
                                                    }
                                                    hasNext={index < tracks.length - 1}
                                                    hasPrevious={index > 0}
                                                    autoPlay={autoPlayTrackId === track.id}
                                                />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            // Members Tab
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                loading="lazy"
                                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                {getInitials(user.name || user.email || "User")}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                {user.name || user.email}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Producător
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-medium rounded-full">
                                        Proprietar
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Studio Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Editează Studio
                            </h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Logo Studio
                                </label>
                                <div className="flex items-center gap-6">
                                    {editPhotoURL ? (
                                        <img
                                            src={editPhotoURL}
                                            alt="Studio"
                                            className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                                            <FiMusic className="text-3xl" />
                                        </div>
                                    )}
                                    <div>
                                        <label
                                            htmlFor="studio-avatar-upload"
                                            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer transition-colors text-sm font-medium"
                                        >
                                            {uploadingImage ? "Se încarcă..." : "Schimbă logo"}
                                        </label>
                                        <input
                                            id="studio-avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploadingImage}
                                            className="hidden"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            PNG, JPG până la 5MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Nume Studio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nume Studio *
                                </label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    placeholder="Numele studioului"
                                />
                            </div>

                            {/* Descriere */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descriere
                                </label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                                    placeholder="Descrie studioul tău..."
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Studio
                                </label>
                                <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    placeholder="contact@studio.com"
                                />
                            </div>

                            {/* Locație */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Locație
                                </label>
                                <input
                                    type="text"
                                    value={editLocation}
                                    onChange={(e) => setEditLocation(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    placeholder="București, România"
                                />
                            </div>

                            {/* Telefon */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Număr de Telefon
                                </label>
                                <input
                                    type="tel"
                                    value={editPhoneNumber}
                                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    placeholder="+40 123 456 789"
                                />
                            </div>

                            {/* Social Media */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Social Media
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Facebook
                                    </label>
                                    <input
                                        type="url"
                                        value={editFacebook}
                                        onChange={(e) => setEditFacebook(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        placeholder="https://facebook.com/studio"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Instagram
                                    </label>
                                    <input
                                        type="url"
                                        value={editInstagram}
                                        onChange={(e) => setEditInstagram(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        placeholder="https://instagram.com/studio"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        YouTube
                                    </label>
                                    <input
                                        type="url"
                                        value={editYoutube}
                                        onChange={(e) => setEditYoutube(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        placeholder="https://youtube.com/studio"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Anulează
                            </button>
                            <button
                                onClick={handleSaveStudio}
                                disabled={saving || !editName.trim()}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                            >
                                {saving ? "Se salvează..." : "Salvează"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Track Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Upload Track
                            </h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            >
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Titlu Track */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nume Track *
                                </label>
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    placeholder="Numele piesei"
                                />
                            </div>

                            {/* Descriere */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Descriere
                                </label>
                                <textarea
                                    value={uploadDescription}
                                    onChange={(e) => setUploadDescription(e.target.value)}
                                    rows={3}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                                    placeholder="Descrierea track-ului..."
                                />
                            </div>

                            {/* Gen și Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Gen Muzical
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadGenre}
                                        onChange={(e) => setUploadGenre(e.target.value)}
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        placeholder="Hip-hop, Pop, etc."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={uploadStatus}
                                        onChange={(e) =>
                                            setUploadStatus(
                                                e.target.value as "Work in Progress" | "Pre-Release" | "Release"
                                            )
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                    >
                                        <option value="Work in Progress">Work in Progress</option>
                                        <option value="Pre-Release">Pre-Release</option>
                                        <option value="Release">Release</option>
                                    </select>
                                </div>
                            </div>

                            {/* Audio File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Fișier Audio *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => setUploadAudioFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                        id="audio-upload"
                                    />
                                    <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center">
                                        <FiUpload className="text-4xl text-gray-400 dark:text-gray-500 mb-3" />
                                        {uploadAudioFile ? (
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {uploadAudioFile.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {(uploadAudioFile.size / (1024 * 1024)).toFixed(2)} MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Click pentru a selecta fișier audio
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    MP3, WAV, FLAC (max 50MB)
                                                </p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                disabled={uploadingTrack}
                                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                Anulează
                            </button>
                            <button
                                onClick={handleUploadTrack}
                                disabled={uploadingTrack || !uploadTitle.trim() || !uploadAudioFile}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                <FiUpload />
                                {uploadingTrack ? "Se încarcă..." : "Upload Track"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            <AlertModal
                isOpen={alert.isOpen}
                onClose={closeAlert}
                type={alert.type}
                title={alert.title}
                message={alert.message}
            />
        </div>
    );
};

export default Studio;

