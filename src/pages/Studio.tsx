import React, { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { Link, Navigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FiArrowLeft, FiUser, FiSave } from "react-icons/fi";

const Studio: React.FC = () => {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [description, setDescription] = useState("");
  const [studioExists, setStudioExists] = useState(false);
  const [saving, setSaving] = useState(false);

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

  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (user.accountType !== "producer") return <Navigate to="/dashboard" replace />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
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
    } catch (error) {
      console.error("Error saving studio:", error);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Studio
            </h1>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              <FiArrowLeft />
              <span>Înapoi la Dashboard</span>
            </Link>
          </div>

          {/* Owner Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-semibold text-white">
                {getInitials(user.name)}
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {user.name}
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <FiUser size={14} />
                <span>Vezi profilul proprietarului</span>
              </Link>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400">
            Pagină studio pentru conturile de tip Producător. Aici poți adăuga o descriere a studioului tău.
          </p>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descriere Studio
              </label>
              <textarea
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrie studioul tău, echipamentul, serviciile oferite..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSave />
                <span>
                  {saving
                    ? "Se salvează..."
                    : studioExists
                    ? "Actualizează"
                    : "Creează studio"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Studio;
