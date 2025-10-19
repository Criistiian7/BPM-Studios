import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate, useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FiEdit2,
  FiMusic,
  FiUsers,
  FiX,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUpload,
  FiCheck
} from "react-icons/fi";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import type { Studio as StudioType, StudioMember } from "../types/studio";
import type { Track } from "../types/track";
import AlertModal from "../components/AlertModal";
import { useAlert } from "../hooks/useAlert";
import AudioPlayer from "../components/AudioPlayer";
import { slugify } from "../utils/slugify";
import { getInitials } from "../utils/formatters";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useTrackNavigation } from "../hooks/useTrackNavigation";

const Studio: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { alert: alertState, showSuccess, showError, showWarning, closeAlert } = useAlert();
  const [initializing, setInitializing] = useState(true);
  const [studio, setStudio] = useState<StudioType | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [members, setMembers] = useState<StudioMember[]>([]);
  const [activeTab, setActiveTab] = useState<"tracks" | "members">("tracks");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPhotoURL, setEditPhotoURL] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editPhoneNumber, setEditPhoneNumber] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editYoutube, setEditYoutube] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Upload track states
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadGenre, setUploadGenre] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"Work in Progress" | "Pre-Release" | "Release">("Work in Progress");
  const [uploadCollaborators, setUploadCollaborators] = useState<string[]>([]);
  const [uploadAudioFile, setUploadAudioFile] = useState<File | null>(null);
  const [uploadingTrack, setUploadingTrack] = useState(false);

  // Use track navigation hook
  const { autoPlayTrackId, trackRefs, handleNext, handlePrevious } = useTrackNavigation(tracks);

  useEffect(() => {
    const loadStudio = async () => {
      if (!user) return;

      try {
        const studioRef = doc(db, "studios", user.id);
        const studioSnap = await getDoc(studioRef);

        if (studioSnap.exists()) {
          const studioDataRaw = studioSnap.data();
          const studioData = { id: studioSnap.id, ...studioDataRaw } as StudioType;
          setStudio(studioData);
          setEditName(studioData.name || "");
          setEditDescription(studioData.description || "");
          setEditPhotoURL(studioData.photoURL || null);
          setEditEmail((studioDataRaw.email as string) || (studioDataRaw.ownerEmail as string) || user.email);
          setEditLocation((studioDataRaw.location as string) || "");
          setEditPhoneNumber((studioDataRaw.phoneNumber as string) || "");
          setEditFacebook((studioDataRaw.socialLinks as any)?.facebook || "");
          setEditInstagram((studioDataRaw.socialLinks as any)?.instagram || "");
          setEditYoutube((studioDataRaw.socialLinks as any)?.youtube || "");

          // Fetch tracks
          const tracksRef = collection(db, "tracks");
          const tracksQuery = query(tracksRef, where("userId", "==", user.id));
          const tracksSnap = await getDocs(tracksQuery);
          const tracksData: Track[] = [];
          tracksSnap.forEach((doc) => {
            tracksData.push({ id: doc.id, ...doc.data() } as Track);
          });
          setTracks(tracksData);

          // Fetch members (for now, just the owner)
          const memberData: StudioMember = {
            id: user.id,
            uid: user.id,
            displayName: user.name,
            email: user.email,
            photoURL: user.avatar || null,
            accountType: user.accountType,
            joinedAt: studioData.createdAt,
          };
          setMembers([memberData]);
        } else {
          // Create default studio
          const newStudio: Partial<StudioType> = {
            ownerId: user.id,
            name: `${user.name} Studio`,
            description: "",
            photoURL: user.avatar || null,
            memberIds: [user.id],
            trackCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(studioRef, newStudio);
          setStudio({ id: user.id, ...newStudio } as StudioType);
          setEditName(newStudio.name || "");
          setEditDescription("");
          setEditPhotoURL(user.avatar || null);
        }
      } catch (error) {
        console.error("Error loading studio:", error);
      } finally {
        setInitializing(false);
      }
    };

    if (user) {
      loadStudio();
    } else if (!loading) {
      setInitializing(false);
    }
  }, [user, loading]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      showWarning("Fișierul este prea mare. Maxim 5MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      showWarning("Te rog selectează o imagine validă.");
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `studios/${user.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      setEditPhotoURL(url);
    } catch (error) {
      console.error("Error uploading image:", error);
      showError("Eroare la încărcarea imaginii. Te rog încearcă din nou.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveStudio = async () => {
    if (!user || !studio) return;

    // Validare email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editEmail.trim() && !emailRegex.test(editEmail.trim())) {
      showWarning("Adresa de email nu este validă.");
      return;
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
      showError("Eroare la salvarea studioului. Te rog încearcă din nou.");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadTrack = async () => {
    if (!user || !uploadAudioFile || !uploadTitle.trim()) {
      showWarning("Te rog completează titlul și selectează un fișier audio.");
      return;
    }

    setUploadingTrack(true);
    try {
      // Upload audio file to storage
      const storageRef = ref(storage, `tracks/${user.id}/${Date.now()}_${uploadAudioFile.name}`);
      const snapshot = await uploadBytes(storageRef, uploadAudioFile);
      const audioURL = await getDownloadURL(snapshot.ref);

      // Create track document in Firestore using the standardized API
      const trackPayload = {
        title: uploadTitle.trim(),
        description: uploadDescription.trim(),
        genre: uploadGenre.trim(),
        status: uploadStatus,
        audioURL,
        ownerId: user.id,
        ownerName: user.name || user.email || "Unknown",
        uploadedByStudio: true, // Flag că a fost încărcat de studio
        studioName: studio?.name || null, // Save studio name
        studioId: studio?.id || user.id,
        collaborators: uploadCollaborators,
      };

      const tracksRef = collection(db, "tracks");
      const docPayload = {
        ...trackPayload,
        userId: user.id, // backward compatibility
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(tracksRef), docPayload);

      // Reload tracks
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
      setUploadCollaborators([]);
      setUploadAudioFile(null);
      setShowUploadModal(false);

      showSuccess("Track-ul a fost încărcat cu succes!");
    } catch (error) {
      console.error("Error uploading track:", error);
      showError("Eroare la încărcarea track-ului. Te rog încearcă din nou.");
    } finally {
      setUploadingTrack(false);
    }
  };

  const toggleCollaborator = (memberId: string) => {
    setUploadCollaborators(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  if (loading || initializing) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (user.accountType !== "producer") return <Navigate to="/profile" replace />;
  if (!studio) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto p-6">
        {/* Studio Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between gap-6">
            {/* Left: Avatar + Info */}
            <div className="flex items-start gap-6 flex-1">
              {/* Avatar */}
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

              {/* Info */}
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
                      <a href={`tel:${(studio as any).phoneNumber}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {(studio as any).phoneNumber}
                      </a>
                    </div>
                  )}
                  {((studio as any).email || user.email) && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                      <FiMail className="text-indigo-600 dark:text-indigo-400" />
                      <a href={`mailto:${(studio as any).email || user.email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {(studio as any).email || user.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Media */}
                {((studio as any).socialLinks?.facebook || (studio as any).socialLinks?.instagram || (studio as any).socialLinks?.youtube) && (
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
                    <span className="font-medium">{members.length}</span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {members.length === 1 ? "membru" : "membri"}
                    </span>
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

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Upload Track Button */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="p-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                title="Upload Track"
              >
                <FiUpload className="text-xl" />
              </button>

              {/* Edit Studio Button */}
              <button
                onClick={() => setShowEditModal(true)}
                className="p-3 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                title="Editează Studio"
              >
                <FiEdit2 className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
                <span>Membri ({members.length})</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "tracks" ? (
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
                      className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/70 transition-all duration-300 overflow-hidden hover:border-blue-300 dark:hover:border-blue-600"
                    >
                      {track.audioURL && (
                        <AudioPlayer
                          audioURL={track.audioURL}
                          title={track.title}
                          genre={track.genre}
                          status={track.status}
                          uploadedBy={
                            (track as any).uploadedByStudio && (track as any).studioName
                              ? (track as any).studioName
                              : (track as any).ownerName || user?.name || "Studio"
                          }
                          uploadedById={
                            (track as any).uploadedByStudio && (track as any).studioId
                              ? (track as any).studioId
                              : user?.id
                          }
                          trackId={track.id}
                          currentUserId={user?.id}
                          currentUserName={user?.name || user?.email || "Unknown"}
                          collaborators={track.collaborators || []}
                          onUploadedByClick={() => {
                            // Dacă e încărcat de studio, navighează la profil studio
                            if ((track as any).uploadedByStudio && (track as any).studioId && studio?.name) {
                              const studioSlug = `${slugify(studio.name)}-${user.id.substring(0, 6)}`;
                              navigate(`/profile/${studioSlug}`);
                            } else if (user?.id) {
                              // Track personal - navighează la profil personal
                              const userSlug = `${slugify(user.name || 'user')}-${user.id.substring(0, 6)}`;
                              navigate(`/profile/${userSlug}`);
                            }
                          }}
                          onEdit={() => {
                            // TODO: Implementează logica de editare pentru studio tracks
                          }}
                          onDelete={() => {
                            // TODO: Implementează logica de ștergere pentru studio tracks
                          }}
                          onNext={(wasPlaying) => handleNext(index, wasPlaying)}
                          onPrevious={(wasPlaying) => handlePrevious(index, wasPlaying)}
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
              <div className="space-y-4">
                {members.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <FiUsers className="mx-auto text-5xl mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nu ai membri în studio</p>
                    <p className="text-sm">Membrii studioului vor apărea aici</p>
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {member.photoURL ? (
                          <img
                            src={member.photoURL}
                            alt={member.displayName}
                            loading="lazy"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                            {getInitials(member.displayName)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {member.displayName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {member.accountType === "producer" ? "Producător" : "Artist"}
                          </p>
                        </div>
                      </div>
                      {member.uid === user.id && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-medium rounded-full">
                          Proprietar
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Studio Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-custom">
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

            <div className="p-6 space-y-6">
              {/* Avatar Upload */}
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
                      {uploading ? "Se încarcă..." : "Schimbă logo"}
                    </label>
                    <input
                      id="studio-avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      PNG, JPG până la 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Studio Name */}
              <div>
                <label
                  htmlFor="studio-name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nume Studio *
                </label>
                <input
                  id="studio-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Numele studioului"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="studio-description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Descriere
                </label>
                <textarea
                  id="studio-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Descrie studioul tău, echipamentul, serviciile oferite..."
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="studio-email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Studio
                </label>
                <input
                  id="studio-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="contact@studio.com"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email pentru contact studio (poate fi diferit de email-ul tău personal)
                </p>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="studio-location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Locație
                </label>
                <input
                  id="studio-location"
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="București, România"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="studio-phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Număr de Telefon
                </label>
                <input
                  id="studio-phone"
                  type="tel"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="+40 123 456 789"
                />
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Social Media
                </h3>

                {/* Facebook */}
                <div>
                  <label
                    htmlFor="studio-facebook"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Facebook
                  </label>
                  <input
                    id="studio-facebook"
                    type="url"
                    value={editFacebook}
                    onChange={(e) => setEditFacebook(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="https://facebook.com/studio"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label
                    htmlFor="studio-instagram"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Instagram
                  </label>
                  <input
                    id="studio-instagram"
                    type="url"
                    value={editInstagram}
                    onChange={(e) => setEditInstagram(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="https://instagram.com/studio"
                  />
                </div>

                {/* YouTube */}
                <div>
                  <label
                    htmlFor="studio-youtube"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    YouTube
                  </label>
                  <input
                    id="studio-youtube"
                    type="url"
                    value={editYoutube}
                    onChange={(e) => setEditYoutube(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="https://youtube.com/studio"
                  />
                </div>
              </div>
            </div>

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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-custom">
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

            <div className="p-6 space-y-6">
              {/* Track Title */}
              <div>
                <label htmlFor="track-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nume Track *
                </label>
                <input
                  id="track-title"
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Numele piesei"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="track-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descriere
                </label>
                <textarea
                  id="track-description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Descrierea track-ului..."
                />
              </div>

              {/* Genre and Status Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Genre */}
                <div>
                  <label htmlFor="track-genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gen Muzical
                  </label>
                  <input
                    id="track-genre"
                    type="text"
                    value={uploadGenre}
                    onChange={(e) => setUploadGenre(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Hip-hop, Pop, etc."
                  />
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="track-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    id="track-status"
                    value={uploadStatus}
                    onChange={(e) => setUploadStatus(e.target.value as any)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  >
                    <option value="Work in Progress">Work in Progress</option>
                    <option value="Pre-Release">Pre-Release</option>
                    <option value="Release">Release</option>
                  </select>
                </div>
              </div>

              {/* Collaborators */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Colaboratori
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 scrollbar-custom">
                  {members.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Nu există membri în studio
                    </p>
                  ) : (
                    members.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={uploadCollaborators.includes(member.uid)}
                          onChange={() => toggleCollaborator(member.uid)}
                          className="w-5 h-5 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          {member.photoURL ? (
                            <img
                              src={member.photoURL}
                              alt={member.displayName}
                              loading="lazy"
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(member.displayName)}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {member.displayName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {member.accountType === "producer" ? "Producător" : "Artist"}
                            </p>
                          </div>
                          {uploadCollaborators.includes(member.uid) && (
                            <FiCheck className="text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {uploadCollaborators.length > 0 && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                    {uploadCollaborators.length} colaborator{uploadCollaborators.length > 1 ? 'i' : ''} selectat{uploadCollaborators.length > 1 ? 'i' : ''}
                  </p>
                )}
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
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
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

            {/* Footer Buttons */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploadingTrack}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anulează
              </button>
              <button
                onClick={handleUploadTrack}
                disabled={uploadingTrack || !uploadTitle.trim() || !uploadAudioFile}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {uploadingTrack ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Se încarcă...</span>
                  </>
                ) : (
                  <>
                    <FiUpload />
                    <span>Upload Track</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        type={alertState.type}
        title={alertState.title}
        message={alertState.message}
      />
    </div>
  );
};

export default Studio;
