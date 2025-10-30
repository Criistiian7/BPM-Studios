import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { UserProfile as UserProfileType } from "../types/user";
import { FiArrowLeft, FiMapPin, FiMail, FiPhone, FiStar } from "react-icons/fi";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { slugify } from "../utils/slugify";
import AudioPlayer from "../components/AudioPlayer";
import { useAuth } from "../context/authContext";
import { getInitials, isProducer, isStudio } from "../utils/formatters";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useTrackNavigation } from "../hooks/useTrackNavigation";

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

  // Use track navigation hook
  const { autoPlayTrackId, trackRefs, handleNext, handlePrevious } = useTrackNavigation(userTracks);

  useEffect(() => {
    if (!profile?.uid) return;

    const fetchUserTracks = async () => {
      setLoadingTracks(true);
      try {
        const tracksRef = collection(db, "tracks");

        // Fetch DOAR track-urile unde profilul este owner
        const ownerQuery = query(tracksRef, where("ownerId", "==", profile.uid));
        const ownerSnapshot = await getDocs(ownerQuery);
        const ownerTracks = ownerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setUserTracks(ownerTracks);
        setTrackCount(ownerTracks.length);
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
        // PASUL 1: Caută în colecția users după câmpul slug
        const usersRef = collection(db, "users");
        const slugQuery = query(usersRef, where("slug", "==", slug));
        const slugSnapshot = await getDocs(slugQuery);

        if (!slugSnapshot.empty) {
          const userData = slugSnapshot.docs[0].data() as UserProfileType;
          setProfile(userData);
          setLoading(false);
          return;
        }

        // PASUL 2: Caută în colecția studios după câmpul slug
        const studiosRef = collection(db, "studios");
        const studiosSlugQuery = query(studiosRef, where("slug", "==", slug));
        const studiosSlugSnapshot = await getDocs(studiosSlugQuery);

        if (!studiosSlugSnapshot.empty) {
          const studioData = studiosSlugSnapshot.docs[0].data();
          const studioProfile: UserProfileType = {
            uid: studiosSlugSnapshot.docs[0].id,
            displayName: studioData.name || "Studio",
            email: studioData.ownerEmail || "",
            phoneNumber: studioData.phoneNumber || "",
            photoURL: studioData.photoURL || studioData.ownerAvatar,
            accountType: "studio",
            description: studioData.description || "Studio de producție",
            location: studioData.location || "",
            genre: studioData.genre || "",
            rating: studioData.rating || 0,
            socialLinks: studioData.socialLinks || {},
            statistics: studioData.statistics || { tracksUploaded: 0, projectsCompleted: 0 },
            memberSince: studioData.createdAt || "",
            slug: studioData.slug || slug,
            // Studio-specific owner data
            ownerId: studioData.ownerId,
            ownerName: studioData.ownerName || studioData.name || "Owner",
          };
          setProfile(studioProfile);
          setLoading(false);
          return;
        }

        // PASUL 3: Fallback - caută prin toate documentele users
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

        // PASUL 4: Fallback - caută prin toate documentele studios
        const allStudiosSnapshot = await getDocs(studiosRef);

        for (const docSnapshot of allStudiosSnapshot.docs) {
          const studioData = docSnapshot.data();

          // Generează slug din name + uid și compară
          const baseSlug = slugify(studioData.name || '');
          const generatedSlug = `${baseSlug}-${docSnapshot.id.substring(0, 6)}`;

          if (generatedSlug === slug) {
            const studioProfile: UserProfileType = {
              uid: docSnapshot.id,
              displayName: studioData.name || "Studio",
              email: studioData.ownerEmail || "",
              phoneNumber: studioData.phoneNumber || "",
              photoURL: studioData.photoURL || studioData.ownerAvatar,
              accountType: "studio",
              description: studioData.description || "Studio de producție",
              location: studioData.location || "",
              genre: studioData.genre || "",
              rating: studioData.rating || 0,
              socialLinks: studioData.socialLinks || {},
              statistics: studioData.statistics || { tracksUploaded: 0, projectsCompleted: 0 },
              memberSince: studioData.createdAt || "",
              slug: studioData.slug || slug,
              // Studio-specific owner data
              ownerId: studioData.ownerId,
              ownerName: studioData.ownerName || studioData.name || "Owner",
            };
            setProfile(studioProfile);
            setLoading(false);
            return;
          }
        }

        // Nu s-a găsit nimic
        setError("Profilul nu a fost găsit.");
        setLoading(false);

      } catch (error) {
        console.error("Error fetching profile:", error);
        setError("Eroare la încărcarea profilului.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  if (loading) {
    return <LoadingSpinner fullScreen />;
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

  const initials = profile.displayName ? getInitials(profile.displayName) : "?";

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
                <img src={profile.photoURL} alt={profile.displayName || "User"} loading="lazy" className="w-32 h-32 rounded-full object-cover border-4 border-primary-500 shadow-lg" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-white dark:border-gray-700">
                  {initials}
                </div>
              )}
            </div>

            {/* Info de baza */}
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {profile.displayName || "Utilizator"}
              </h1>

              {/* Owner Info pentru Studio */}
              {profile.accountType === "studio" && profile.ownerId && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Owner:</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (profile.ownerId) {
                        const ownerSlug = `${slugify(profile.ownerName || 'user')}-${profile.ownerId.substring(0, 6)}`;
                        navigate(`/profile/${ownerSlug}`);
                      }
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-base flex items-center gap-1 transition-colors"
                  >
                    <span>{profile.ownerName || "Unknown Owner"}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${isStudio(profile.accountType)
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : isProducer(profile.accountType)
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  }`}>
                  {isStudio(profile.accountType)
                    ? "🏢 Studio"
                    : isProducer(profile.accountType)
                      ? "🎛️ Producător"
                      : "🎤 Artist"}
                </span>

                {isStudio(profile.accountType) && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FiStar className="fill-current text-sm" />
                    <span className="text-sm font-semibold">{(profile.rating || 0).toFixed(1)}</span>
                  </div>
                )}

                {profile.accountType !== "studio" && profile.rating !== undefined && profile.rating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <FiStar className="fill-current text-sm" />
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
                        className="p-3 text-slate-500 dark:text-slate-400 hover:text-[#1877F2] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Facebook"
                        aria-label="Facebook"
                      >
                        <FaFacebook className="text-2xl" />
                      </a>
                    )}
                    {profile.socialLinks.instagram && (
                      <a
                        href={profile.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 text-slate-500 dark:text-slate-400 hover:text-[#E4405F] hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                        title="Instagram"
                        aria-label="Instagram"
                      >
                        <FaInstagram className="text-2xl" />
                      </a>
                    )}
                    {profile.socialLinks.youtube && (
                      <a
                        href={profile.socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 text-slate-500 dark:text-slate-400 hover:text-[#FF0000] hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                        title="YouTube"
                        aria-label="YouTube"
                      >
                        <FaYoutube className="text-2xl" />
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
              <div className="space-y-4">
                {userTracks.map((track, index) => (
                  <div
                    key={track.id}
                    ref={(el) => {
                      trackRefs.current[track.id] = el;
                    }}
                    className="border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-300/50 dark:hover:shadow-slate-900/70 transition-all duration-300 overflow-hidden hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    {track.audioURL && (
                      <AudioPlayer
                        audioURL={track.audioURL}
                        title={track.title}
                        genre={track.genre}
                        status={track.status}
                        uploadedBy={
                          (track as any).uploadedByStudio && (track as any).studioName
                            ? (track as any).studioName
                            : (track as any).ownerName || profile?.displayName || profile?.email || "Unknown"
                        }
                        uploadedById={
                          (track as any).uploadedByStudio && (track as any).studioId
                            ? (track as any).studioId
                            : (track as any).ownerId || (track as any).userId || profile?.uid
                        }
                        studioId={(track as any).uploadedByStudio && (track as any).studioId ? (track as any).studioId : undefined}
                        trackId={track.id}
                        currentUserId={currentUser?.id}
                        currentUserName={currentUser?.name}
                        collaborators={track.collaborators || []}
                        onUploadedByClick={() => {
                          // Dacă e încărcat de studio, navighează la profil studio
                          if ((track as any).uploadedByStudio && (track as any).studioId) {
                            const studioSlug = `${slugify((track as any).studioName || 'studio')}-${(track as any).studioId.substring(0, 6)}`;
                            navigate(`/profile/${studioSlug}`);
                          } else if (profile) {
                            const slug = profile.slug || `${slugify(profile.displayName || '')}-${profile.uid.substring(0, 6)}`;
                            navigate(`/profile/${slug}`);
                          }
                        }}
                        onEdit={currentUser && currentUser.id === profile?.uid ? () => {
                          // Navigate to profile edit page
                          navigate("/profile-edit");
                        } : undefined}
                        onDelete={currentUser && currentUser.id === profile?.uid ? async () => {
                          // Note: Track deletion should be handled in MyTracks component
                          // This is user profile view, not track management
                        } : undefined}
                        onNext={(wasPlaying) => handleNext(index, wasPlaying)}
                        onPrevious={(wasPlaying) => handlePrevious(index, wasPlaying)}
                        hasNext={index < userTracks.length - 1}
                        hasPrevious={index > 0}
                        autoPlay={autoPlayTrackId === track.id}
                      />
                    )}
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
