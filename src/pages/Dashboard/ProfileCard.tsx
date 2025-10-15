import React from "react";
import { useAuth } from "../../context/authContext";
import { FiStar, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { FaFacebook, FaInstagram, FaYoutube, FaMicrophone } from "react-icons/fa";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Avatar, SocialLinks, AccountTypeBadge, RatingBadge } from "../../components/shared";
import { useTracks } from "../../hooks/useTracks";
import { formatDate } from "../../utils";

const ProfileCard: React.FC = () => {
  const { user } = useAuth();
  const { trackCount, loading: loadingTracks } = useTracks(user?.id);

  if (!user) return null;


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors">
      {/* Header Section with Avatar and Basic Info */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center gap-6">
          <Avatar 
            src={user.avatar} 
            name={user.name} 
            size="xl" 
            className="border-white shadow-lg"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">
              {user.name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <AccountTypeBadge 
                accountType={user.accountType} 
                className="bg-white/20 backdrop-blur-sm text-white"
              />
              <RatingBadge rating={user.rating} />
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
        {user.socialLinks && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Social Media
            </h3>
            <SocialLinks socialLinks={user.socialLinks} size="md" />
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
                  {loadingTracks ? (
                    <div className="animate-pulse">...</div>
                  ) : (
                    trackCount
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Track-uri
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {user.statistics?.projectsCompleted || 0}
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
            Membru din {formatDate(user.memberSince)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
