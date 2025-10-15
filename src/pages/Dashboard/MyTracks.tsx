import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { fetchTracksByOwner, createTrackFirestore, updateTrackFirestore } from "../../firebase/api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import AudioPlayer from "../../components/AudioPlayer";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { slugify } from "../../utils/slugify";

const MyTracks: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState<any | null>(null);
  const [deletingTrack, setDeletingTrack] = useState<any | null>(null);
  const [autoPlayTrackId, setAutoPlayTrackId] = useState<string | null>(null);
  const trackRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  // Reset autoPlayTrackId after it's been used
  useEffect(() => {
    if (autoPlayTrackId) {
      const timer = setTimeout(() => {
        setAutoPlayTrackId(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlayTrackId]);

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
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setSubmitting(true);
      setError(null);
      try {
        await updateTrackFirestore(track.id, {
          title,
          description,
          status,
          genre,
        });

        // Actualizează track-ul în state
        setTracks((prev) =>
          prev.map((t) =>
            t.id === track.id ? { ...t, title, description, status, genre } : t
          )
        );

        onClose();
      } catch (err: any) {
        setError(err.message ?? "Update failed");
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
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Upload Track
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {tracks.map((t, index) => (
            <div
              key={t.id}
              ref={(el) => (trackRefs.current[t.id] = el)}
              className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/70 transition-all duration-300 overflow-hidden hover:border-blue-300 dark:hover:border-blue-600"
            >
              {t.audioURL && (
                <AudioPlayer
                  audioURL={t.audioURL}
                  title={t.title}
                  genre={t.genre}
                  status={t.status}
                  uploadedBy={user?.name || user?.email || "Unknown"}
                  onUploadedByClick={() => {
                    if (user?.slug) {
                      navigate(`/profile/${user.slug}`);
                    } else if (user?.id) {
                      const slug = `${slugify(user.name || user.email || 'user')}-${user.id.substring(0, 6)}`;
                      navigate(`/profile/${slug}`);
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
            } catch (error) {
              console.error("Error deleting track:", error);
              alert("Eroare la ștergerea track-ului");
            }
          }}
        />
      )}
    </div>
  );
};

export default MyTracks;
