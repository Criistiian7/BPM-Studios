import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiEdit2, FiTrash2, FiSkipBack, FiSkipForward, FiShuffle, FiRepeat, FiStar } from "react-icons/fi";
import RatingModal from "./RatingModal";
import { saveTrackRating, getUserTrackRating, isConnectedToTrackOwner } from "../firebase/ratings";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { slugify } from "../utils/slugify";
import { useNavigate } from "react-router-dom";

interface Collaborator {
    id: string;
    name: string;
    slug: string;
}

interface AudioPlayerProps {
    audioURL: string;
    title?: string;
    genre?: string;
    status?: string;
    uploadedBy?: string;
    uploadedById?: string;
    trackId?: string;
    currentUserId?: string;
    currentUserName?: string;
    collaborators?: string[]; // Array of collaborator IDs
    onUploadedByClick?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onNext?: (wasPlaying: boolean) => void;
    onPrevious?: (wasPlaying: boolean) => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
    autoPlay?: boolean;
    className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
    audioURL,
    title,
    genre,
    status,
    uploadedBy,
    uploadedById,
    trackId,
    currentUserId,
    currentUserName,
    collaborators = [],
    onUploadedByClick,
    onEdit,
    onDelete,
    onNext,
    onPrevious,
    hasNext = false,
    hasPrevious = false,
    autoPlay = false,
    className = ""
}) => {
    const navigate = useNavigate();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [isShuffleOn, setIsShuffleOn] = useState(false);
    const [repeatMode, setRepeatMode] = useState<'off' | 'one'>('off');
    const audioRef = useRef<HTMLAudioElement>(null);
    const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Rating states
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [currentRating, setCurrentRating] = useState(0);
    const [canRate, setCanRate] = useState(false);
    const [checkingConnection, setCheckingConnection] = useState(true);

    // Collaborators states
    const [collaboratorsList, setCollaboratorsList] = useState<Collaborator[]>([]);
    const [loadingCollaborators, setLoadingCollaborators] = useState(false);

    // Memoize collaborators array to prevent unnecessary re-renders
    const collaboratorsKey = useMemo(() => 
        collaborators?.join(',') || '', 
    [collaborators]);

    // Fetch collaborators data with real-time updates
    useEffect(() => {
        if (!collaborators || collaborators.length === 0) {
            setCollaboratorsList([]);
            setLoadingCollaborators(false);
            return;
        }

        setLoadingCollaborators(true);
        const unsubscribers: (() => void)[] = [];
        const tempCollaborators: { [key: string]: Collaborator } = {};
        let loadedCount = 0;

        // Setup listeners for all collaborators
        collaborators.forEach((collabId) => {
            try {
                const userDocRef = doc(db, "users", collabId);
                
                const unsubscribe = onSnapshot(
                    userDocRef,
                    (docSnapshot) => {
                        if (docSnapshot.exists()) {
                            const userData = docSnapshot.data();
                            const userName = userData.name || userData.displayName || "Unknown";
                            
                            tempCollaborators[collabId] = {
                                id: collabId,
                                name: userName,
                                slug: `${slugify(userName || 'user')}-${collabId.substring(0, 6)}`
                            };

                            loadedCount++;

                            // Only update when all collaborators are loaded (first time)
                            // or update immediately for subsequent changes
                            if (loadedCount >= collaborators.length || Object.keys(tempCollaborators).length > 0) {
                                const updatedList = collaborators
                                    .map(id => tempCollaborators[id])
                                    .filter(Boolean);

                                setCollaboratorsList(updatedList);
                                setLoadingCollaborators(false);
                            }
                        }
                    },
                    (error) => {
                        console.error(`Error loading collaborator:`, error);
                        loadedCount++;
                        // Even on error, update the list
                        if (loadedCount >= collaborators.length) {
                            setLoadingCollaborators(false);
                        }
                    }
                );

                unsubscribers.push(unsubscribe);
            } catch (error) {
                console.error(`Error setting up listener:`, error);
            }
        });

        // Cleanup all listeners on unmount or when collaborators change
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [collaboratorsKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Check if user can rate (is connected to track owner)
    useEffect(() => {
        const checkRatingPermission = async () => {
            if (!currentUserId || !uploadedById || !trackId) {
                setCanRate(false);
                setCheckingConnection(false);
                return;
            }

            try {
                const connected = await isConnectedToTrackOwner(currentUserId, uploadedById);
                setCanRate(connected);

                // Load current user's rating if they can rate
                if (connected) {
                    const rating = await getUserTrackRating(trackId, currentUserId);
                    setCurrentRating(rating);
                }
            } catch (error) {
                console.error("Error checking rating permission:", error);
                setCanRate(false);
            } finally {
                setCheckingConnection(false);
            }
        };

        checkRatingPermission();
    }, [currentUserId, uploadedById, trackId]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = volume;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            if (repeatMode === 'one') {
                // Repeat current track
                audio.currentTime = 0;
                audio.play();
            } else {
                setIsPlaying(false);
                setCurrentTime(0);
            }
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);

            // Cleanup volume timeout
            if (volumeTimeoutRef.current) {
                clearTimeout(volumeTimeoutRef.current);
            }
        };
    }, [audioURL, volume, repeatMode]);

    // Reset player when audioURL changes or component mounts
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        setCurrentTime(0);
        setDuration(0);

        // Auto-play if autoPlay is true
        if (autoPlay) {
            audio.load();
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                }).catch(() => {
                    setIsPlaying(false);
                });
            }
        }
    }, [audioURL, autoPlay]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play();
            setIsPlaying(true);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        if (newVolume === 0) {
            setIsMuted(true);
        } else {
            setIsMuted(false);
        }
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            audio.volume = volume;
            setIsMuted(false);
        } else {
            audio.volume = 0;
            setIsMuted(true);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleVolumeMouseEnter = () => {
        // Clear any existing timeout
        if (volumeTimeoutRef.current) {
            clearTimeout(volumeTimeoutRef.current);
            volumeTimeoutRef.current = null;
        }
        setShowVolumeSlider(true);
    };

    const handleVolumeMouseLeave = () => {
        // Delay hiding the slider by 2 seconds
        volumeTimeoutRef.current = setTimeout(() => {
            setShowVolumeSlider(false);
        }, 2000);
    };

    const toggleRepeat = () => {
        setRepeatMode(repeatMode === 'off' ? 'one' : 'off');
    };

    const handleSubmitRating = async (rating: number) => {
        if (!currentUserId || !currentUserName || !uploadedById || !trackId) {
            throw new Error("Missing required information for rating");
        }

        try {
            await saveTrackRating(trackId, currentUserId, currentUserName, uploadedById, rating);
            setCurrentRating(rating);
            console.log(`✅ Rating saved: ${rating} stars`);
        } catch (error) {
            console.error("Error saving rating:", error);
            throw error;
        }
    };

    const progress = useMemo(() => 
        duration > 0 ? (currentTime / duration) * 100 : 0,
    [currentTime, duration]);

    return (
        <div className={`relative group ${className}`}>
            <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6 backdrop-blur-sm rounded-2xl overflow-hidden">
                {/* 3 Column Layout */}
                <div className="flex items-center gap-6">
                    {/* LEFT: Track Info */}
                    <div className="flex-shrink-0 w-64">
                        {title && (
                            <div className="space-y-2">
                                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">
                                    {title}
                                </h4>
                                <div className="flex gap-2 flex-wrap">
                                    {genre && (
                                        <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-blue-500/10 to-violet-500/10 dark:from-blue-500/20 dark:to-violet-500/20 text-blue-700 dark:text-blue-300 rounded-full font-semibold border border-blue-200/50 dark:border-blue-500/30">
                                            {genre}
                                        </span>
                                    )}
                                    {status && (
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status === "Work in Progress"
                                                ? "bg-gradient-to-r from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/20 dark:to-amber-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200/50 dark:border-yellow-500/30"
                                                : status === "Pre-Release"
                                                    ? "bg-gradient-to-r from-purple-500/10 to-violet-500/10 dark:from-purple-500/20 dark:to-violet-500/20 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-500/30"
                                                    : "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-500/30"
                                            }`}>
                                            {status}
                                        </span>
                                    )}
                                </div>
                                {uploadedBy && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Uploaded by:{" "}
                                            {onUploadedByClick ? (
                                                <button
                                                    onClick={onUploadedByClick}
                                                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline transition-colors"
                                                >
                                                    {uploadedBy}
                                                </button>
                                            ) : (
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{uploadedBy}</span>
                                            )}
                                        </p>

                                        {/* Featuring with Collaborators */}
                                        {!loadingCollaborators && collaboratorsList.length > 0 && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Featuring with:{" "}
                                                {collaboratorsList.slice(0, 2).map((collab, index) => (
                                                    <span key={collab.id}>
                                                        {index > 0 && ", "}
                                                        <button
                                                            onClick={() => navigate(`/profile/${collab.slug}`)}
                                                            className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors"
                                                        >
                                                            {collab.name}
                                                        </button>
                                                    </span>
                                                ))}
                                                {collaboratorsList.length > 2 && (
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                                        {" "}și +{collaboratorsList.length - 2} {collaboratorsList.length - 2 === 1 ? 'altul' : 'alții'}
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                        {canRate && !checkingConnection && (
                                            <button
                                                onClick={() => setShowRatingModal(true)}
                                                className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors group/rate"
                                            >
                                                <FiStar className="text-sm group-hover/rate:fill-yellow-500" />
                                                <span className="font-medium">
                                                    {currentRating > 0 ? `Your rating: ${currentRating} ⭐` : 'Rate this Song'}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* CENTER: Player Controls */}
                    <div className="flex-1 min-w-0">
                        <div className="space-y-3">
                            {/* Main Controls Row */}
                            <div className="flex items-center justify-center gap-3">
                                {/* Shuffle Button */}
                                <button
                                    onClick={() => setIsShuffleOn(!isShuffleOn)}
                                    className={`p-2 rounded-lg transition-all duration-200 ${isShuffleOn
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                                        }`}
                                    aria-label="Shuffle"
                                    title="Shuffle"
                                >
                                    <FiShuffle className="text-lg" />
                                </button>

                                {/* Previous Button */}
                                <button
                                    onClick={() => {
                                        if (hasPrevious && onPrevious) {
                                            const wasPlaying = isPlaying;
                                            // Pause current track
                                            if (audioRef.current && isPlaying) {
                                                audioRef.current.pause();
                                                setIsPlaying(false);
                                            }
                                            // Navigate to previous and pass playing state
                                            onPrevious(wasPlaying);
                                        }
                                    }}
                                    disabled={!hasPrevious}
                                    className={`p-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all duration-200 hover:scale-110 ${!hasPrevious ? 'opacity-40 cursor-not-allowed hover:scale-100 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-transparent' : ''
                                        }`}
                                    aria-label="Previous"
                                    title={hasPrevious ? "Previous Track" : "No previous track"}
                                >
                                    <FiSkipBack className="text-xl" />
                                </button>

                                {/* Play/Pause Button */}
                                <button
                                    onClick={togglePlay}
                                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 hover:from-blue-600 hover:via-blue-700 hover:to-violet-700 text-white rounded-full shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-110 active:scale-95"
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                >
                                    {isPlaying ? (
                                        <FiPause className="text-xl" />
                                    ) : (
                                        <FiPlay className="text-xl ml-0.5" />
                                    )}
                                </button>

                                {/* Next Button */}
                                <button
                                    onClick={() => {
                                        if (hasNext && onNext) {
                                            const wasPlaying = isPlaying;
                                            // Pause current track
                                            if (audioRef.current && isPlaying) {
                                                audioRef.current.pause();
                                                setIsPlaying(false);
                                            }
                                            // Navigate to next and pass playing state
                                            onNext(wasPlaying);
                                        }
                                    }}
                                    disabled={!hasNext}
                                    className={`p-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all duration-200 hover:scale-110 ${!hasNext ? 'opacity-40 cursor-not-allowed hover:scale-100 hover:text-slate-600 dark:hover:text-slate-400 hover:bg-transparent' : ''
                                        }`}
                                    aria-label="Next"
                                    title={hasNext ? "Next Track" : "No next track"}
                                >
                                    <FiSkipForward className="text-xl" />
                                </button>

                                {/* Repeat Button */}
                                <button
                                    onClick={toggleRepeat}
                                    className={`p-2 rounded-lg transition-all duration-200 relative ${repeatMode !== 'off'
                                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'
                                        }`}
                                    aria-label={`Repeat: ${repeatMode}`}
                                    title={repeatMode === 'off' ? 'Repeat Off' : 'Repeat One'}
                                >
                                    <FiRepeat className="text-lg" />
                                    {repeatMode === 'one' && (
                                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-600 dark:bg-blue-400 text-white dark:text-slate-900 text-[8px] font-bold rounded-full flex items-center justify-center">
                                            1
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Progress Bar and Time */}
                            <div className="flex items-center gap-3">
                                {/* Time Display - Current */}
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold tabular-nums min-w-[40px]">
                                    {formatTime(currentTime)}
                                </span>

                                {/* Progress Bar */}
                                <div className="flex-1 relative h-2 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden group/progress cursor-pointer shadow-inner">
                                    {/* Progress Fill */}
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-blue-600 to-violet-600 transition-all duration-100 shadow-sm"
                                        style={{ width: `${progress}%` }}
                                    />
                                    {/* Seek Input */}
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 0}
                                        step="0.1"
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        aria-label="Seek"
                                    />
                                    {/* Hover indicator */}
                                    <div className="absolute inset-0 bg-blue-400/20 opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none" />
                                </div>

                                {/* Time Display - Duration */}
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold tabular-nums min-w-[40px] text-right">
                                    {formatTime(duration)}
                                </span>

                                {/* Volume Control */}
                                <div
                                    className="relative flex-shrink-0"
                                    onMouseEnter={handleVolumeMouseEnter}
                                    onMouseLeave={handleVolumeMouseLeave}
                                >
                                    <button
                                        onClick={toggleMute}
                                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all duration-200"
                                        aria-label={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted || volume === 0 ? (
                                            <FiVolumeX className="text-lg" />
                                        ) : (
                                            <FiVolume2 className="text-lg" />
                                        )}
                                    </button>

                                    {/* Volume Slider - Extended hover area */}
                                    {showVolumeSlider && (
                                        <div className="absolute bottom-full right-0 mb-2 p-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                    {Math.round((isMuted ? 0 : volume) * 100)}%
                                                </span>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={isMuted ? 0 : volume}
                                                    onChange={handleVolumeChange}
                                                    className="w-28 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-violet-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-blue-500/50 hover:[&::-webkit-slider-thumb]:scale-110 [&::-webkit-slider-thumb]:transition-transform"
                                                    style={{
                                                        background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(124 58 237) ${(isMuted ? 0 : volume) * 100}%, rgb(226 232 240) ${(isMuted ? 0 : volume) * 100}%, rgb(226 232 240) 100%)`
                                                    }}
                                                    aria-label="Volume"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Action Buttons */}
                    <div className="flex-shrink-0">
                        {(onEdit || onDelete) && (
                            <div className="flex flex-col gap-2">
                                {onEdit && (
                                    <button
                                        onClick={onEdit}
                                        className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all duration-200 hover:scale-105"
                                        title="Edit Track"
                                        aria-label="Edit Track"
                                    >
                                        <FiEdit2 className="text-lg" />
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={onDelete}
                                        className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all duration-200 hover:scale-105"
                                        title="Delete Track"
                                        aria-label="Delete Track"
                                    >
                                        <FiTrash2 className="text-lg" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Hidden Audio Element */}
                <audio ref={audioRef} src={audioURL} preload="metadata" />
            </div>

            {/* Rating Modal */}
            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmitRating={handleSubmitRating}
                trackTitle={title || "Track"}
                currentRating={currentRating}
            />
        </div>
    );
};

export default AudioPlayer;
