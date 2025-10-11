import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { Link, Navigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { FiArrowLeft, FiMail, FiUser, FiMapPin, FiPhone, FiMusic, FiSave, FiCamera } from "react-icons/fi";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import type { UserProfile } from "../types/user";

const ProfileEdit: React.FC = () => {
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const userRef = doc(db, "users", user.id);
        const snap = await getDoc(userRef);
        
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          const fullName = data.displayName || "";
          // Split only on first space to allow multiple names
          const firstSpaceIndex = fullName.indexOf(' ');
          if (firstSpaceIndex > -1) {
            setFirstName(fullName.substring(0, firstSpaceIndex));
            setLastName(fullName.substring(firstSpaceIndex + 1));
          } else {
            setFirstName(fullName);
            setLastName("");
          }
          setDescription(data.description || "");
          setGenre(data.genre || "");
          setLocation(data.location || "");
          setPhoneNumber(data.phoneNumber || "");
          setPhotoURL(data.photoURL || null);
          setFacebook(data.socialLinks?.facebook || "");
          setInstagram(data.socialLinks?.instagram || "");
          setYoutube(data.socialLinks?.youtube || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Fișierul este prea mare. Maxim 5MB." });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: "error", text: "Te rog selectează o imagine validă." });
      return;
    }

    setUploading(true);
    setMessage(null);
    
    try {
      const storageRef = ref(storage, `avatars/${user.id}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      // Update state immediately
      setPhotoURL(url);
      
      // Update Firestore
      const userRef = doc(db, "users", user.id);
      await setDoc(userRef, { photoURL: url }, { merge: true });
      
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: url });
      }
      
      setMessage({ type: "success", text: "Imaginea a fost încărcată cu succes!" });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      setMessage({ 
        type: "error", 
        text: `Eroare la încărcarea imaginii: ${error.message || 'Încearcă din nou'}` 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      // Trim and preserve spaces in names
      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      
      if (!displayName) {
        setMessage({ type: "error", text: "Te rog completează numele!" });
        return;
      }
      
      const userRef = doc(db, "users", user.id);
      const snap = await getDoc(userRef);
      const existingData = snap.exists() ? snap.data() : {};

      await setDoc(userRef, {
        ...existingData,
        uid: user.id,
        email: user.email,
        displayName,
        photoURL,
        description: description.trim(),
        genre: genre.trim(),
        location: location.trim(),
        phoneNumber: phoneNumber.trim(),
        socialLinks: {
          facebook: facebook.trim() || null,
          instagram: instagram.trim() || null,
          youtube: youtube.trim() || null,
        },
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // Update Firebase Auth displayName and photo
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          displayName,
          photoURL: photoURL || undefined
        });
      }

      setMessage({ type: "success", text: "Profilul a fost salvat cu succes!" });
      
      // Reload page after 1.5 seconds to refresh user data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setMessage({ 
        type: "error", 
        text: `Eroare la salvarea profilului: ${error.message || 'Încearcă din nou'}` 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Editare Profil
              </h2>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <FiArrowLeft />
                <span>Înapoi</span>
              </Link>
            </div>
          </div>

          {/* Message Alert */}
          {message && (
            <div className={`mx-6 mt-6 p-4 rounded-lg ${
              message.type === "success" 
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800" 
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="p-6 space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={(`${firstName} ${lastName}`.trim() || user.name) || "Avatar"}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-semibold text-white border-4 border-gray-200 dark:border-gray-700">
                    {getInitials(`${firstName} ${lastName}`.trim() || user.name)}
                  </div>
                )}
                <label 
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full cursor-pointer transition-colors shadow-lg"
                >
                  <FiCamera />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploading && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Se încarcă imaginea...
                </p>
              )}
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiUser />
                Informații Personale
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prenume *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Prenumele tău"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nume *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Numele tău de familie"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <FiMail className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiMapPin className="inline mr-1" />
                    Locație
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="București, România"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiPhone className="inline mr-1" />
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="+40 712 345 678"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiMusic />
                Informații Profesionale
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gen muzical
                </label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Hip-Hop, Trap, Pop, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descriere
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Scrie câteva cuvinte despre tine, experiența ta, stilul muzical..."
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Link-uri Social Media
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FaFacebook className="inline mr-1 text-blue-600" />
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://facebook.com/username sau facebook.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FaInstagram className="inline mr-1 text-pink-600" />
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://instagram.com/username sau instagram.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FaYoutube className="inline mr-1 text-red-600" />
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://youtube.com/channel/... sau youtube.com/channel/..."
                  />
                </div>
              </div>
            </div>

            {/* Account Type Info */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tip cont
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.accountType === "producer" ? "Producător" : "Artist"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rating
                  </p>
                  <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-500">
                    ★ {user.rating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave />
                <span>{saving ? "Se salvează..." : "Salvează modificările"}</span>
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Anulează
              </Link>
            </div>
          </form>
      </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
