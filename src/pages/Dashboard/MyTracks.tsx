import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { fetchTracksByOwner, createTrackFirestore } from "../../firebase/api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import AudioPlayer from "../../components/AudioPlayer";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const MyTracks: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

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

  const UploadModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [genre, setGenre] = useState("");
    const [status, setStatus] = useState<"Work in Progress" | "Pre-Release" | "Release">("Work in Progress");
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        onClose();
      } catch (err: any) {
        setError(err.message ?? "Upload failed");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Upload Track Nou</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Titlu</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Descriere</label>
              <textarea className="mt-1 w-full border rounded px-3 py-2" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Gen Muzical</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Ex: Hip-Hop, Pop..." />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Status</label>
              <select className="mt-1 w-full border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="Work in Progress">Work in Progress</option>
                <option value="Pre-Release">Pre-Release</option>
                <option value="Release">Release</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Fișier Audio</label>
              <input type="file" accept="audio/*" onChange={handleFile} className="mt-1 w-full border rounded px-3 py-2" required />
              <p className="text-xs text-gray-500 mt-1">MP3, WAV (max 50MB)</p>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Anulează</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-indigo-600 text-white">{submitting ? "Se încarcă..." : "Upload Track"}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Piesele mele</h3>
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
          {tracks.map((t) => (
            <div
              key={t.id}
              className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{t.title}</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 flex gap-3 mt-1">
                    {t.genre && <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">{t.genre}</span>}
                    {t.status && <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">{t.status}</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // TODO: Implementează logica de editare
                      console.log("Edit track:", t.id);
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    title="Edit Track"
                  >
                    <FiEdit2 />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm("Ești sigur că vrei să ștergi acest track?")) {
                        try {
                          await deleteDoc(doc(db, "tracks", t.id));
                          await refreshUser();
                          setTracks(tracks.filter(track => track.id !== t.id));
                        } catch (error) {
                          console.error("Error deleting track:", error);
                          alert("Eroare la ștergerea track-ului");
                        }
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Delete Track"
                  >
                    <FiTrash2 />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>

              {t.audioURL && (
                <AudioPlayer audioURL={t.audioURL} />
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
    </div>
  );
};

export default MyTracks;
