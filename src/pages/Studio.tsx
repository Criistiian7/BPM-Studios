import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Link, Navigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Studio: React.FC = () => {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [description, setDescription] = useState("");
  const [studioExists, setStudioExists] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const ref = doc(db, "studios", user.id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setStudioExists(true);
        const data = snap.data();
        setDescription((data?.description as string) ?? "");
      }
      setInitializing(false);
    };
    if (user) {
      load();
    } else if (!loading) {
      setInitializing(false);
    }
  }, [user, loading]);

  if (loading || initializing) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.accountType !== "producer") return <Navigate to="/dashboard" replace />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const ref = doc(db, "studios", user.id);
    await setDoc(ref, {
      ownerId: user.id,
      ownerName: user.name,
      ownerEmail: user.email,
      ownerAvatar: user.avatar ?? null,
      description,
      updatedAt: new Date().toISOString(),
    });
    setStudioExists(true);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded shadow p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Studio</h1>
          <Link to={`/dashboard`} className="text-indigo-600">Înapoi la Dashboard</Link>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700">
            {user.name.split(" ").map((n)=>n[0]).slice(0,2).join("")}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <Link to="/dashboard" className="text-sm text-indigo-600">Vezi profilul proprietarului</Link>
          </div>
        </div>
        <p className="text-gray-600 mt-4">Pagină studio pentru conturile de tip Producător. Aici poți adăuga o descriere a studioului.</p>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600">Descriere</label>
            <textarea
              className="mt-1 w-full border rounded px-3 py-2"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Despre studioul tău..."
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded bg-indigo-600 text-white">
              {studioExists ? "Actualizează" : "Creează studio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Studio;
