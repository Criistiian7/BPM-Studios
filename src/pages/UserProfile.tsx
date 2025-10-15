import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { UserProfile as UserProfileType } from "../types/user";
import { FiArrowLeft, FiMapPin, FiMail, FiPhone, FiStar, FiEdit2 } from "react-icons/fi";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { slugify } from "../utils/slugify";
import AudioPlayer from "../components/AudioPlayer";
import { useAuth } from "../context/authContext";

const UserProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackCount, setTrackCount] = useState<number>(0);
  const [userTracks, setUserTracks] = useState<any[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  useEffect(() => {
    if (!profile?.uid) return;

    const fetchUserTracks = async () => {
      setLoadingTracks(true);
      try {
        const tracksRef = collection(db, "tracks");
        const q = query(tracksRef, where("ownerId", "==", profile.uid));
        const snapshot = await getDocs(q);
        const tracks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUserTracks(tracks);
        setTrackCount(tracks.length);
      } catch (error) {
        console.error("Error fetching tracks:", error);
      } finally {
        setLoadingTracks(false);
      }
    };

    fetchUserTracks();
  }, [profile?.uid]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        const usersRef = collection(db, "users");

        // PASUL 1: Caută după câmpul slug
        const slugQuery = query(usersRef, where("slug", "==", slug));
        const slugSnapshot = await getDocs(slugQuery);

        if (!slugSnapshot.empty) {
          const userData = slugSnapshot.docs[0].data() as UserProfileType;
          setProfile(userData);
          setLoading(false);
          return;
        }

        // PASUL 2: Fallback - caută prin toate documentele
        const allUsersSnapshot = await getDocs(usersRef);

        for (const docSnapshot of allUsersSnapshot.docs) {
          const userData = docSnapshot.data();

          // Generează slug din displayName + uid și compară
          const baseSlug = slugify(userData.displayName || '');
          const generatedSlug = `${baseSlug}-${docSnapshot.id.substring(0, 6)}`;

          if (generatedSlug === slug) {
            setProfile({
              uid: docSnapshot.id,
              ...userData
            } as UserProfileType);
            setLoading(false);
            return;
          }
        }

        // Nu s-a găsit nimic
        setError("Profilul nu a fost găsit.");
        setLoading(false);

      } catch (error) {
        setError("Eroare la încărcarea profilului.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Profilul nu a fost găsit."}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Înapoi
          </button>
        </div>
      </div>
    );
  }

  const initials =
    profile.displayName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header cu boton inapoi */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <FiArrowLeft className="text-xl" />
          <span className="font-medium">Înapoi</span>
        </button>

        {/* Card Profil */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-x1 p-8">
          {/* Avatar si Info de baza */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName || "User"} className="w-32 h-32 rounded-full object-cover border-4 border-primary-500 shadow-lg" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-white dark:border-gray-700">
                  {initials}
                </div>
              )}
            </div>

            {/* Info de baza */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {profile.displayName || "Utilizator"}
              </h1>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.accountType === "producer" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
                  {profile.accountType === "producer" ? "🎛️ Producător" : "🎤 Artist"}
                </span>

                {profile.rating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FiStar className="fill-current" />
                    <span className="text-sm font-semibold">{profile.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {profile.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {profile.description}
              </p>
              )}

          {/* Contact Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Informații de contact</h2>

          {profile.email && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FiMail className="text-primary-500 flex-shrink-0" />
              <a href={`mailto:${profile.email}`} className="hover:text-primary-600 transition-colors">
                      {profile.email}
              </a>
            </div>
          )}

          {profile.phoneNumber && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FiPhone className="text-primary-500 flex-shrink-0" />
              <a href={`tel:${profile.phoneNumber}`} className="hover:text-primary-500 transition-colors">
                {profile.phoneNumber}
              </a>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FiMapPin className="text-primary-500 flex-shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>

        {/* Social Media */}
        {(profile.socialLinks?.facebook || profile.socialLinks?.instagram || profile.socialLinks?.youtube) && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Social Media</h2>
                  <div className="flex gap-3 flex-wrap">
              {profile.socialLinks.facebook && (
                <a
                  href={profile.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#0d65d9] transition-colors shadow-md"
                >
                  <FaFacebook className="text-xl" />
                  <span className="font-semibold">Facebook</span>
                </a>
              )}
              {profile.socialLinks.instagram && (
                <a
                  href={profile.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
                >
                  <FaInstagram className="text-xl" />
                  <span className="font-semibold">Instagram</span>
                </a>
              )}
              {profile.socialLinks.youtube && (
                <a
                  href={profile.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] text-white rounded-lg hover:bg-[#cc0000] transition-colors shadow-md"
                >
                  <FaYoutube className="text-xl" />
                  <span className="font-semibold">YouTube</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

          {/* Tracks Section - SEPARAT SUB containerul principal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">♫</span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Tracks ({trackCount})
              </h2>
            </div>

            {loadingTracks ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : userTracks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Nu sunt track-uri încărcate</p>
              </div>
            ) : (
              <div className="space-y-6">
                {userTracks.map((track) => (
                  <div
                    key={track.id}
                    className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800"
                  >
                    {/* Gradient overlay pentru efect modern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative p-8">
                      {/* Header cu iconița animată și titlul */}
                      <div className="flex items-start gap-6 mb-6">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                            <span className="text-white text-3xl drop-shadow-lg">🎵</span>
                          </div>
                          {/* Efect de glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                            {track.title}
                          </h3>

                          {/* Tags moderne cu animații */}
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Genul muzical */}
                            {track.genre && (
                              <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                🎶 {track.genre}
                              </span>
                            )}

                            {/* Statusul cu iconițe */}
                            {track.status && (
                              <span className={`px-4 py-2 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${track.status === "Release"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300"
                                : track.status === "Pre-Release"
                                  ? "bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300"
                                  : "bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30 text-gray-700 dark:text-gray-300"
                                }`}>
                                {track.status === "Release" ? "✨ " : track.status === "Pre-Release" ? "🚀 " : "🛠️ "}
                                {track.status}
                              </span>
                            )}
                          </div>

                          {/* Uploaded by cu design modern */}
                          <div className="mt-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="text-sm">Uploaded by:</span>
                            <button
                              onClick={() => {
                                const slug = profile.slug || `${slugify(profile.displayName || '')}-${profile.uid.substring(0, 6)}`;
                                navigate(`/profile/${slug}`);
                              }}
                              className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                              👤 {profile.displayName}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Player cu butoane Play/Pause */}
                      {track.audioURL && (
                        <div className="space-y-4">
                          <AudioPlayer audioURL={track.audioURL} />

                          {/* Buton Edit Track doar pentru owner */}
                          {currentUser && currentUser.id === profile.uid && (
                            <div className="flex justify-end">
                              <button
                                onClick={() => {
                                  // TODO: Implementează logica de editare
                                  console.log("Edit track:", track.id);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                              >
                                <FiEdit2 className="text-lg" />
                                <span>Edit Track</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default UserProfile;
