import React from "react";
import { useAuth } from "../../context/authContext";
import { FiStar, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaFacebook, FaInstagram, FaYoutube, FaMicrophone } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const ProfileCard: React.FC = () => {
  const { user } = useAuth();
  const [trackCount, setTrackCount] = React.useState<number>(0);
  const [projectCount, setProjectCount] = React.useState<number>(0);
  const [loadingStats, setLoadingStats] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const fetchTrackStats = async () => {
      try {
        const tracksRef = collection(db, "tracks");
        const allTracksQuery = query(tracksRef, where("ownerId", "==", user.id));
        const allTracksSnapshot = await getDocs(allTracksQuery);

        // Număr total de tracks
        setTrackCount(allTracksSnapshot.size);

        // Număr tracks cu status "Work in Progress" (= proiecte)
        const wipTracks = allTracksSnapshot.docs.filter(doc => {
          const trackData = doc.data();
          return trackData.status === "Work in Progress";
        });
        setProjectCount(wipTracks.length);
      } catch (error) {
        console.error("Error counting tracks:", error);
        setTrackCount(0);
        setProjectCount(0);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchTrackStats();
  }, [user]);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors">
      {/* Header Section with Avatar and Basic Info */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center gap-6">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-2xl font-semibold text-indigo-600 shadow-lg">
              {getInitials(user.name)}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm text-white px-3 py-1 text-sm font-medium">
                {user.accountType === "producer" ? "Producător" : "Artist"}
              </span>
              <span className="inline-flex items-center gap-1 text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                <FiStar className="fill-current text-yellow-300" />
                {user.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 space-y-4">
        {/* Description */}
        {user.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Despre
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {user.description}
            </p>
          </div>
        )}

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Email */}
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <FiMail className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm truncate">{user.email}</p>
            </div>
          </div>

          {/* Location */}
          {user.location && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FiMapPin className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Locație</p>
                <p className="text-sm">{user.location}</p>
              </div>
            </div>
          )}

          {/* Phone */}
          {user.phoneNumber && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FiPhone className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Telefon</p>
                <p className="text-sm">{user.phoneNumber}</p>
              </div>
            </div>
          )}

          {/* Genre */}
          {user.genre && (
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <FaMicrophone className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Gen muzical</p>
                <p className="text-sm">{user.genre}</p>
              </div>
            </div>
          )}
        </div>

        {/* Social Media Links */}
        {(user.socialLinks?.facebook || user.socialLinks?.instagram || user.socialLinks?.youtube) && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Social Media
            </h3>
            <div className="flex flex-wrap gap-3">
              {user.socialLinks.facebook && (
                <a
                  href={user.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 text-slate-500 dark:text-slate-400 hover:text-[#1877F2] hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <FaFacebook className="text-2xl" />
                </a>
              )}
              {user.socialLinks.instagram && (
                <a
                  href={user.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 text-slate-500 dark:text-slate-400 hover:text-[#E4405F] hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <FaInstagram className="text-2xl" />
                </a>
              )}
              {user.socialLinks.youtube && (
                <a
                  href={user.socialLinks.youtube}
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

        {/* Statistics */}
        {user.statistics && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Statistici
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {loadingStats ? (
                    <div className="animate-pulse">...</div>
                  ) : (
                    trackCount
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Track-uri
                </div>
              </div>
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {loadingStats ? (
                    <div className="animate-pulse">...</div>
                  ) : (
                    projectCount
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Proiecte
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Member Since */}
        {user.memberSince && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
            Membru din {new Date(user.memberSince).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
