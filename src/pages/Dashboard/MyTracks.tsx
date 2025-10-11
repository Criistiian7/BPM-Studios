import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { fetchTracksByOwner, createTrackFirestore } from "../../firebase/api";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const MyTracks: React.FC = () => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState<number>(120);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFile(e.target.files?.[0] ?? null);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    let fileUrl: string | undefined;
    if (file) {
      const storageRef = ref(
        storage,
        `tracks/${user.id}/${Date.now()}_${file.name}`
      );
      const snap = await uploadBytes(storageRef, file);
      fileUrl = await getDownloadURL(snap.ref);
    }
    const created = await createTrackFirestore({
      title,
      bpm,
      ownerId: user.id,
      fileUrl,
    });
    setTracks((prev) => [created, ...prev]);
    setTitle("");
    setBpm(120);
    setFile(null);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">My Tracks</h3>

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Track title"
          className="px-3 py-2 border rounded flex-1"
          required
        />
        <input
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          type="number"
          min={30}
          max={300}
          className="w-24 px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Add
        </button>
      </form>

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
                <div className="text-sm text-gray-500">BPM: {t.bpm}</div>
              </div>
              <div className="text-sm text-gray-600">Actions</div>
            </li>
          ))}
          {tracks.length === 0 && (
            <li className="text-gray-500">No tracks yet</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default MyTracks;
