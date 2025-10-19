import React, { useEffect, useRef, useState } from 'react';
import type { UserProfile } from '../types/user';
import { FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt, FaMicrophone, FaEnvelope, FaStar } from 'react-icons/fa';
import { FiX, FiUser } from 'react-icons/fi';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface UserProfileDetailsProps {
    user: UserProfile;
    onClose: () => void;
}

function UserProfileDetails({ user, onClose }: UserProfileDetailsProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [projectCount, setProjectCount] = useState<number>(0);
    const [loadingProjects, setLoadingProjects] = useState(true);

    // Fetch project count (Work in Progress tracks)
    useEffect(() => {
        const fetchProjectCount = async () => {
            if (!user.uid) return;

            try {
                const tracksRef = collection(db, "tracks");
                const q = query(tracksRef, where("ownerId", "==", user.uid));
                const snapshot = await getDocs(q);

                // Count tracks with "Work in Progress" status
                const wipTracks = snapshot.docs.filter(doc => {
                    const trackData = doc.data();
                    return trackData.status === "Work in Progress";
                });
                setProjectCount(wipTracks.length);
            } catch (error) {
                console.error("Error fetching project count:", error);
                setProjectCount(0);
            } finally {
                setLoadingProjects(false);
            }
        };

        fetchProjectCount();
    }, [user.uid]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const getInitials = (name: string) => {
        return name
            ?.split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "U";
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                ref={modalRef}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="profile-modal-title"
            >
                {/* Header with Close Button */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                    <h2 id="profile-modal-title" className="text-2xl font-bold text-gray-900 dark:text-white">
                        Profil Utilizator
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        aria-label="Închide modalul"
                    >
                        <FiX className="text-2xl text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Profile Content */}
                <div className="p-6 space-y-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center gap-4">
                        {user.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt={user.displayName || "User"}
                                className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                                {getInitials(user.displayName || "")}
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {user.displayName || "Utilizator"}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full font-medium">
                                    {user.accountType === "producer" ? "Producător" : "Artist"}
                                </span>
                                {user.rating > 0 && (
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <FaStar className="fill-current" />
                                        <span className="text-sm font-semibold">{user.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {user.description && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                                Despre
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">
                                {user.description}
                            </p>
                        </div>
                    )}

                    {/* Details */}
                    <div className="space-y-3">
                        {/* Location */}
                        {user.location && (
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <FaMapMarkerAlt className="text-lg text-gray-500 dark:text-gray-400" />
                                <span>{user.location}</span>
                            </div>
                        )}

                        {/* Genre */}
                        {user.genre && (
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <FaMicrophone className="text-lg text-gray-500 dark:text-gray-400" />
                                <span>{user.genre}</span>
                            </div>
                        )}

                        {/* Email */}
                        {user.email && (
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <FaEnvelope className="text-lg text-gray-500 dark:text-gray-400" />
                                <a
                                    href={`mailto:${user.email}`}
                                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    {user.email}
                                </a>
                            </div>
                        )}

                        {/* Phone Number */}
                        {user.phoneNumber && (
                            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                <FiUser className="text-lg text-gray-500 dark:text-gray-400" />
                                <span>{user.phoneNumber}</span>
                            </div>
                        )}
                    </div>

                    {/* Statistics */}
                    {user.statistics && (user.statistics.tracksUploaded > 0 || projectCount > 0) && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                                Statistici
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                        {user.statistics.tracksUploaded}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Track-uri
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {loadingProjects ? (
                                            <div className="animate-pulse">...</div>
                                        ) : (
                                            projectCount
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Proiecte (WIP)
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Social Links */}
                    {(user.socialLinks?.facebook || user.socialLinks?.instagram || user.socialLinks?.youtube) && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
                                Social Media
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                {user.socialLinks.facebook && (
                                    <a
                                        href={user.socialLinks.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg transition-colors shadow-md"
                                        aria-label="Facebook"
                                    >
                                        <FaFacebook className="text-xl" />
                                        <span className="font-semibold">Facebook</span>
                                    </a>
                                )}
                                {user.socialLinks.instagram && (
                                    <a
                                        href={user.socialLinks.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:from-[#7232A8] hover:via-[#E91B1B] hover:to-[#F5A742] text-white rounded-lg transition-all shadow-md"
                                        aria-label="Instagram"
                                    >
                                        <FaInstagram className="text-xl" />
                                        <span className="font-semibold">Instagram</span>
                                    </a>
                                )}
                                {user.socialLinks.youtube && (
                                    <a
                                        href={user.socialLinks.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] hover:bg-[#E60000] text-white rounded-lg transition-colors shadow-md"
                                        aria-label="YouTube"
                                    >
                                        <FaYoutube className="text-xl" />
                                        <span className="font-semibold">YouTube</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Member Since */}
                    {user.memberSince && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                            Membru din {new Date(user.memberSince).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserProfileDetails;
