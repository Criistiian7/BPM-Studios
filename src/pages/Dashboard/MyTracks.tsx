import React, { useState, useEffect } from "react";
import { getTracks, createTrack } from "../../api";
import { useAuth } from "../../context/AuthContext";

type Track = { id: string; title: string; bpm: number; ownerId: string };

const MyTracks: React.FC = () => {
    const { user } = useAuth();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [title, setTitle] = useState("");
    const [bpm, setBpm] = useState<number>(120);
    const [loading, setLoading] = useState(false);

   useEffect(() => {
    if (!user) return;
    setLoading(true);
    getTracks(user.id).then(data => {setTracks(data); setLoading(false);
    }).catch(() => setLoading(false));
   }, [user]);

   const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const created = await createTrack({ title, bpm, ownerId: user.id });
    setTracks(prev => [created, ...prev]);
    setTitle("");
    setBpm(120);
   };

    return (
        <div>
      <h3 className="text-lg font-semibold mb-3">My Tracks</h3>

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Track title" className="px-3 py-2 border rounded flex-1" required />
        <input value={bpm} onChange={e=>setBpm(Number(e.target.value))} type="number" min={30} max={300} className="w-24 px-3 py-2 border rounded" />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Add</button>
      </form>

      {loading ? <div>Loading...</div> : (
        <ul className="space-y-3">
          {tracks.map(t => (
            <li key={t.id} className="p-3 border rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-500">BPM: {t.bpm}</div>
              </div>
              <div className="text-sm text-gray-600">Actions</div>
            </li>
          ))}
          {tracks.length === 0 && <li className="text-gray-500">No tracks yet</li>}
        </ul>
      )}
    </div>
  );
};

export default MyTracks;