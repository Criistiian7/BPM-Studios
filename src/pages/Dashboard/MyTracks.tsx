import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { fetchTracksByOwner, createTrackFirestore } from "../../firebase/api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const MyTracks: React.FC = () => {
  const { user } = useAuth();
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
              <input className="mt-1 w-full border rounded px-3 py-2" value={title} onChange={(e)=>setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Descriere</label>
              <textarea className="mt-1 w-full border rounded px-3 py-2" rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Gen Muzical</label>
              <input className="mt-1 w-full border rounded px-3 py-2" value={genre} onChange={(e)=>setGenre(e.target.value)} placeholder="Ex: Hip-Hop, Pop..." />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Status</label>
              <select className="mt-1 w-full border rounded px-3 py-2" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
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
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded bg-indigo-600 text-white">{submitting?"Se încarcă...":"Upload Track"}</button>
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
        <ul className="space-y-3">
          {tracks.map((t) => (
            <li
              key={t.id}
              className="p-3 border rounded flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-500 flex gap-3">
                  {t.genre && <span>{t.genre}</span>}
                  {t.status && <span>• {t.status}</span>}
                </div>
              </div>
              {t.audioURL && (
                <audio controls src={t.audioURL} className="h-8" />
              )}
            </li>
          ))}
          {tracks.length === 0 && (
            <li className="text-gray-500">Nu ai încărcat încă piese</li>
          )}
        </ul>
      )}

      {showModal && <UploadModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default MyTracks;
