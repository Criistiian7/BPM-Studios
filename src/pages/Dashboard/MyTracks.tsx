import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { fetchTracksByOwner, createTrackFirestore, updateTrackFirestore, type UpdateTrackPayload } from "../../firebase/api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { deleteDoc, doc, collection, query, where, getDocs, getDoc } from "firebase/firestore";
import AudioPlayer from "../../components/AudioPlayer";
import { FiTrash2, FiX, FiUpload, FiCheck } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { slugify } from "../../utils/slugify";
import AlertModal from "../../components/AlertModal";
import { useAlert } from "../../hooks/useAlert";

interface Contact {
  id: string;
  connectedUserId: string;
  connectedUserName: string;
  connectedUserAvatar: string | null;
}

const MyTracks: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { alert: alertState, showSuccess, showError, showWarning, closeAlert } = useAlert();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<any | null>(null);
  const [autoPlayTrackId, setAutoPlayTrackId] = useState<string | null>(null);
  const trackRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Upload states
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadGenre, setUploadGenre] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"Work in Progress" | "Pre-Release" | "Release">("Work in Progress");
  const [uploadAudioFile, setUploadAudioFile] = useState<File | null>(null);
  const [uploadingTrack, setUploadingTrack] = useState(false);
  const [hasCollaborators, setHasCollaborators] = useState(false);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchTracksByOwner(user.id)
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  // Fetch contacts for collaborators dropdown
  useEffect(() => {
    if (!user) return;

    const fetchContacts = async () => {
      try {
        const contactsRef = collection(db, "connections");
        const q = query(contactsRef, where("userId", "==", user.id));
        const querySnapshot = await getDocs(q);
        const contactsData: Contact[] = [];

        for (const docSnapshot of querySnapshot.docs) {
          const connectionData = docSnapshot.data();
          const userRef = doc(db, "users", connectionData.connectedUserId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            contactsData.push({
              id: connectionData.connectedUserId,
              connectedUserId: connectionData.connectedUserId,
              connectedUserName: userData.name || userData.displayName || userData.email || "Unknown",
              connectedUserAvatar: userData.photoURL || null,
            });
          }
        }

        setContacts(contactsData);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, [user]);

  // Reset autoPlayTrackId after it's been used
  useEffect(() => {
    if (autoPlayTrackId) {
      const timer = setTimeout(() => {
        setAutoPlayTrackId(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlayTrackId]);

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

      // Create track using existing function (from My Profile - not studio)
      const collaboratorsToSave = hasCollaborators ? selectedCollaborators : [];

      await createTrackFirestore({
        title: uploadTitle.trim(),
        description: uploadDescription.trim(),
        status: uploadStatus,
        genre: uploadGenre.trim(),
        ownerId: user.id,
        ownerName: user.name || user.email || "Unknown", // Save owner name
        audioURL,
        collaborators: collaboratorsToSave,
        uploadedByStudio: false, // Track personal, nu de studio
      });

      // Reload tracks
      const data = await fetchTracksByOwner(user.id);
      setTracks(data);

      // Reset form
      setUploadTitle("");
      setUploadDescription("");
      setUploadGenre("");
      setUploadStatus("Work in Progress");
      setUploadAudioFile(null);
      setHasCollaborators(false);
      setSelectedCollaborators([]);
      setShowUploadModal(false);

      showSuccess("Track-ul a fost încărcat cu succes!");
    } catch (error) {
      console.error("Error uploading track:", error);
      showError("Eroare la încărcarea track-ului. Te rog încearcă din nou.");
    } finally {
      setUploadingTrack(false);
    }
  };

  const toggleCollaborator = (contactId: string) => {
    setSelectedCollaborators(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const UploadModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const UPLOAD_STORAGE_KEY = "bpm_upload_track_form_data";

    // Încarcă datele salvate din localStorage
    const getInitialFormData = () => {
      try {
        const savedData = localStorage.getItem(UPLOAD_STORAGE_KEY);
        if (savedData) {
          return JSON.parse(savedData);
        }
      } catch (err) {
        console.error("Error loading saved upload form data:", err);
      }
      return {
        title: "",
        description: "",
        genre: "",
        status: "Work in Progress" as "Work in Progress" | "Pre-Release" | "Release",
      };
    };

    const initialData = getInitialFormData();
    const [title, setTitle] = useState(initialData.title);
    const [description, setDescription] = useState(initialData.description);
    const [genre, setGenre] = useState(initialData.genre);
    const [status, setStatus] = useState<"Work in Progress" | "Pre-Release" | "Release">(initialData.status);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Salvează datele în localStorage la fiecare modificare
    useEffect(() => {
      const formData = { title, description, genre, status };
      localStorage.setItem(UPLOAD_STORAGE_KEY, JSON.stringify(formData));
    }, [title, description, genre, status]);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAudioFile(e.target.files?.[0] ?? null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !audioFile) return;
      setSubmitting(true);
      setError(null);
      try {
        const storageRef = ref(
          storage,
          `tracks/${user.id}/${Date.now()}_${audioFile.name}`
        );
        const snap = await uploadBytes(storageRef, audioFile);
        const url = await getDownloadURL(snap.ref);

        const created = await createTrackFirestore({
          title,
          description,
          status,
          genre,
          ownerId: user.id,
          audioURL: url,
        });
        setTracks((prev) => [created, ...prev]);
        await refreshUser();

        // Șterge datele salvate din localStorage după upload reușit
        localStorage.removeItem(UPLOAD_STORAGE_KEY);

        onClose();
      } catch (err: any) {
        setError(err.message ?? "Upload failed");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Upload Track Nou</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <FiX className="text-2xl" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titlu</label>
              <input
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Numele piesei..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descriere</label>
              <textarea
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adaugă o descriere..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gen Muzical</label>
              <input
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Ex: Hip-Hop, Pop, Rock..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="Work in Progress">Work in Progress</option>
                <option value="Pre-Release">Pre-Release</option>
                <option value="Release">Release</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Fișier Audio</label>
              <div className="relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFile}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300 dark:hover:file:bg-blue-900/50 file:cursor-pointer cursor-pointer"
                  required
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                <span>📁</span> MP3, WAV (max 50MB)
              </p>
            </div>
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-600 hover:to-violet-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
              >
                {submitting ? "Se încarcă..." : "Upload Track"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditModal: React.FC<{ track: any; onClose: () => void }> = ({ track, onClose }) => {
    const [title, setTitle] = useState(track.title);
    const [description, setDescription] = useState(track.description || "");
    const [genre, setGenre] = useState(track.genre || "");
    const [status, setStatus] = useState<"Work in Progress" | "Pre-Release" | "Release">(track.status || "Work in Progress");
    const [submitting, setSubmitting] = useState(false);

    // Colaboratori states
    const [hasCollaborators, setHasCollaborators] = useState(track.collaborators && track.collaborators.length > 0);
    const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>(track.collaborators || []);

    const toggleEditCollaborator = (contactId: string) => {
      setSelectedCollaborators(prev =>
        prev.includes(contactId)
          ? prev.filter(id => id !== contactId)
          : [...prev, contactId]
      );
    };
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setSubmitting(true);
      setError(null);
      try {
        const collaboratorsToSave = hasCollaborators ? selectedCollaborators : [];

        const updatePayload: UpdateTrackPayload = {
          title,
          description,
          status,
          genre,
          collaborators: collaboratorsToSave
        };

        await updateTrackFirestore(track.id, updatePayload);

        // Actualizează track-ul în state
        setTracks((prev) =>
          prev.map((t) =>
            t.id === track.id ? { ...t, title, description, status, genre, collaborators: collaboratorsToSave } : t
          )
        );

        onClose();
        showSuccess("Track-ul a fost actualizat cu succes!");
      } catch (err: any) {
        setError(err.message ?? "Update failed");
        showError("Eroare la actualizarea track-ului.");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Editează Track</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <FiX className="text-2xl" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Titlu</label>
              <input
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descriere</label>
              <textarea
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Gen Muzical</label>
              <input
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Ex: Hip-Hop, Pop..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="Work in Progress">Work in Progress</option>
                <option value="Pre-Release">Pre-Release</option>
                <option value="Release">Release</option>
              </select>
            </div>

            {/* Colaboratori Section */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={hasCollaborators}
                  onChange={(e) => {
                    setHasCollaborators(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedCollaborators([]);
                    }
                  }}
                  className="w-5 h-5 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Există colaboratori?
                </span>
              </label>
            </div>

            {hasCollaborators && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selectează Colaboratori
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 scrollbar-custom">
                  {contacts.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      Nu ai contacte conectate încă
                    </p>
                  ) : (
                    contacts.map((contact) => (
                      <label
                        key={contact.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCollaborators.includes(contact.connectedUserId)}
                          onChange={() => toggleEditCollaborator(contact.connectedUserId)}
                          className="w-5 h-5 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          {contact.connectedUserAvatar ? (
                            <img
                              src={contact.connectedUserAvatar}
                              alt={contact.connectedUserName}
                              loading="lazy"
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                              {contact.connectedUserName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">
                              {contact.connectedUserName}
                            </p>
                          </div>
                          {selectedCollaborators.includes(contact.connectedUserId) && (
                            <FiCheck className="text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
                {selectedCollaborators.length > 0 && (
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                    {selectedCollaborators.length} colaborator{selectedCollaborators.length > 1 ? 'i' : ''} selectat{selectedCollaborators.length > 1 ? 'i' : ''}
                  </p>
                )}
              </div>
            )}

            {error && <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</div>}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-600 hover:to-violet-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
              >
                {submitting ? "Se salvează..." : "Salvează Modificările"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal: React.FC<{ track: any; onClose: () => void; onConfirm: () => void }> = ({ track, onClose, onConfirm }) => {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
          <div className="p-6">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
              <FiTrash2 className="text-3xl text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 text-center mb-2">
              Șterge Track
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              Sunteți sigur că doriți să ștergeți piesa <span className="font-semibold text-slate-800 dark:text-slate-200">"{track.title}"</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
              >
                Anulează
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 transition-all font-medium shadow-lg shadow-red-500/30"
              >
                Șterge
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Piesele mele</h3>
        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="p-3 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
          title="Upload Track"
        >
          <FiUpload className="text-xl" />
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {tracks.map((t, index) => (
            <div
              key={t.id}
              ref={(el) => { trackRefs.current[t.id] = el; }}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/70 transition-all duration-300 overflow-hidden hover:border-blue-300 dark:hover:border-blue-600"
            >
              {t.audioURL && (
                <AudioPlayer
                  audioURL={t.audioURL}
                  title={t.title}
                  genre={t.genre}
                  status={t.status}
                  uploadedBy={
                    (t as any).uploadedByStudio && (t as any).studioName
                      ? (t as any).studioName
                      : (t as any).ownerName || user?.name || user?.email || "Unknown"
                  }
                  uploadedById={
                    (t as any).uploadedByStudio && (t as any).studioId
                      ? (t as any).studioId
                      : (t as any).ownerId || user?.id
                  }
                  trackId={t.id}
                  currentUserId={user?.id}
                  currentUserName={user?.name}
                  collaborators={t.collaborators || []}
                  onUploadedByClick={() => {
                    // Dacă e încărcat de studio, navighează la profil studio
                    if ((t as any).uploadedByStudio && (t as any).studioId && (t as any).studioName) {
                      const studioSlug = `${slugify((t as any).studioName)}-${(t as any).studioId.substring(0, 6)}`;
                      navigate(`/profile/${studioSlug}`);
                    } else if (user?.id) {
                      // Track personal - generează slug
                      const userSlug = user?.slug || `${slugify(user.name || user.email || 'user')}-${user.id.substring(0, 6)}`;
                      navigate(`/profile/${userSlug}`);
                    }
                  }}
                  onEdit={() => setEditingTrack(t)}
                  onDelete={() => setDeletingTrack(t)}
                  onNext={(wasPlaying) => {
                    if (index < tracks.length - 1) {
                      const nextTrackId = tracks[index + 1].id;
                      if (wasPlaying) {
                        setAutoPlayTrackId(nextTrackId);
                      }
                      trackRefs.current[nextTrackId]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }
                  }}
                  onPrevious={(wasPlaying) => {
                    if (index > 0) {
                      const prevTrackId = tracks[index - 1].id;
                      if (wasPlaying) {
                        setAutoPlayTrackId(prevTrackId);
                      }
                      trackRefs.current[prevTrackId]?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                      });
                    }
                  }}
                  hasNext={index < tracks.length - 1}
                  hasPrevious={index > 0}
                  autoPlay={autoPlayTrackId === t.id}
                />
              )}
            </div>
          ))}
          {tracks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Nu ai încărcat încă piese
            </div>
          )}
        </div>
      )}

      {showModal && <UploadModal onClose={() => setShowModal(false)} />}
      {editingTrack && (
        <EditModal
          track={editingTrack}
          onClose={() => setEditingTrack(null)}
        />
      )}
      {deletingTrack && (
        <DeleteConfirmModal
          track={deletingTrack}
          onClose={() => setDeletingTrack(null)}
          onConfirm={async () => {
            try {
              await deleteDoc(doc(db, "tracks", deletingTrack.id));
              await refreshUser();
              setTracks(tracks.filter(track => track.id !== deletingTrack.id));
              setDeletingTrack(null);
              showSuccess("Track-ul a fost șters cu succes!");
            } catch (error) {
              console.error("Error deleting track:", error);
              showError("Eroare la ștergerea track-ului. Te rog încearcă din nou.");
            }
          }}
        />
      )}

      {/* New Upload Modal with Collaborators */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-custom">
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

            <div className="p-6 space-y-5">
              {/* Track Title */}
              <div>
                <label htmlFor="upload-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nume Track *
                </label>
                <input
                  id="upload-title"
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  placeholder="Numele piesei"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="upload-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descriere
                </label>
                <textarea
                  id="upload-description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                  placeholder="Descrierea track-ului..."
                />
              </div>

              {/* Genre and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="upload-genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gen Muzical
                  </label>
                  <input
                    id="upload-genre"
                    type="text"
                    value={uploadGenre}
                    onChange={(e) => setUploadGenre(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Hip-hop, Pop..."
                  />
                </div>

                <div>
                  <label htmlFor="upload-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    id="upload-status"
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

              {/* Colaboratori Checkbox */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={hasCollaborators}
                    onChange={(e) => {
                      setHasCollaborators(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedCollaborators([]);
                      }
                    }}
                    className="w-5 h-5 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Există colaboratori?
                  </span>
                </label>
              </div>

              {/* Colaboratori Dropdown - Apare doar dacă checkbox e checked */}
              {hasCollaborators && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Selectează Colaboratori
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 scrollbar-custom">
                    {contacts.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        Nu ai contacte conectate încă
                      </p>
                    ) : (
                      contacts.map((contact) => (
                        <label
                          key={contact.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCollaborators.includes(contact.connectedUserId)}
                            onChange={() => toggleCollaborator(contact.connectedUserId)}
                            className="w-5 h-5 text-indigo-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="flex items-center gap-3 flex-1">
                            {contact.connectedUserAvatar ? (
                              <img
                                src={contact.connectedUserAvatar}
                                alt={contact.connectedUserName}
                                loading="lazy"
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                {contact.connectedUserName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {contact.connectedUserName}
                              </p>
                            </div>
                            {selectedCollaborators.includes(contact.connectedUserId) && (
                              <FiCheck className="text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedCollaborators.length > 0 && (
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-2">
                      {selectedCollaborators.length} colaborator{selectedCollaborators.length > 1 ? 'i' : ''} selectat{selectedCollaborators.length > 1 ? 'i' : ''}
                    </p>
                  )}
                </div>
              )}

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
                    id="upload-audio"
                  />
                  <label htmlFor="upload-audio" className="cursor-pointer flex flex-col items-center">
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

export default MyTracks;
