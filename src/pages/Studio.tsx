import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
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
  FiPlay, 
  FiEdit, 
  FiTrash2 
} from "react-icons/fi";
import type { Studio as StudioType, StudioMember } from "../types/studio";
import type { Track } from "../types/track";

const Studio: React.FC = () => {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [studio, setStudio] = useState<StudioType | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [members, setMembers] = useState<StudioMember[]>([]);
  const [activeTab, setActiveTab] = useState<"tracks" | "members">("tracks");
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Edit form states
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPhotoURL, setEditPhotoURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadStudio = async () => {
      if (!user) return;
      
      try {
        const studioRef = doc(db, "studios", user.id);
        const studioSnap = await getDoc(studioRef);
        
        if (studioSnap.exists()) {
          const studioData = { id: studioSnap.id, ...studioSnap.data() } as StudioType;
          setStudio(studioData);
          setEditName(studioData.name || "");
          setEditDescription(studioData.description || "");
          setEditPhotoURL(studioData.photoURL || null);
          
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
      alert("Fișierul este prea mare. Maxim 5MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Te rog selectează o imagine validă.");
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
      alert("Eroare la încărcarea imaginii");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveStudio = async () => {
    if (!user || !studio) return;

    setSaving(true);
    try {
      const studioRef = doc(db, "studios", user.id);
      const updatedStudio: Partial<StudioType> = {
        name: editName.trim(),
        description: editDescription.trim(),
        photoURL: editPhotoURL,
      updatedAt: new Date().toISOString(),
      };

      await setDoc(studioRef, updatedStudio, { merge: true });
      setStudio({ ...studio, ...updatedStudio } as StudioType);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error saving studio:", error);
      alert("Eroare la salvarea studioului");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (user.accountType !== "producer") return <Navigate to="/dashboard" replace />;
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

            {/* Right: Edit Button */}
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-md"
            >
              <FiEdit2 />
              <span>Editează Studio</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("tracks")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "tracks"
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
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "members"
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
              <div className="space-y-4">
                {tracks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <FiMusic className="mx-auto text-5xl mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nu ai track-uri încărcate</p>
                    <p className="text-sm">Track-urile tale vor apărea aici</p>
                  </div>
                ) : (
                  tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                          <FiMusic className="text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                            {track.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <span>{track.genre}</span>
                            <span>•</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                track.status === "Release"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : track.status === "Pre-Release"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {track.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                          <FiPlay />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors">
                          <FiEdit />
                        </button>
                        <button className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
                          <FiTrash2 />
                        </button>
                      </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                  rows={6}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Descrie studioul tău, echipamentul, serviciile oferite..."
            />
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
    </div>
  );
};

export default Studio;
