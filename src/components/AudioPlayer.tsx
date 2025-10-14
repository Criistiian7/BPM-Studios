import React, { useState, useRef, useEffect } from "react";
import { FiPlay, FiPause } from "react-icons/fi";

interface AudioPlayerProps {
    audioURL: string;
    className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioURL, className = "" }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [audioURL]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const newTime = parseFloat(e.target.value);
        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={`relative ${className}`}>
            <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-inner border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                        onClick={togglePlay}
                        className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <FiPause className="text-xl" />
                        ) : (
                            <FiPlay className="text-xl ml-0.5" />
                        )}
                    </button>

                    {/* Progress Bar and Time */}
                    <div className="flex-1 space-y-2">
                        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            {/* Progress */}
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-100"
                                style={{ width: `${progress}%` }}
                            />
                            {/* Seek Input */}
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                aria-label="Seek"
                            />
                        </div>

                        {/* Time Display */}
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 font-medium">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Audio Element */}
            <audio ref={audioRef} src={audioURL} preload="metadata" />

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
    );
};

export default AudioPlayer;

