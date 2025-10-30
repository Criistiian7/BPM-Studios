import React from "react";
import { FiMusic } from "react-icons/fi";
import { Card } from "../common/CommonComponents";
import AudioPlayer from "../AudioPlayer";
import type { Track } from "../../types/track";

interface StudioTracksProps {
    tracks: Track[];
    studioName: string;
    loading: boolean;
    studioId?: string;
    currentUserId?: string;
    currentUserName?: string;
}

/**
 * Componenta StudioTracks - afișează track-urile unui studio
 * Componentă simplă pentru gestionarea track-urilor
 */
export const StudioTracks: React.FC<StudioTracksProps> = ({
    tracks,
    studioName,
    loading,
    studioId,
    currentUserId,
    currentUserName,
}) => {
    if (loading) {
        return (
            <Card>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <FiMusic className="mr-2" />
                        Tracks
                    </h3>
                    <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    if (tracks.length === 0) {
        return (
            <Card>
                <div className="text-center py-8">
                    <FiMusic className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Nu există tracks
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Acest studio nu are tracks încărcate încă.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FiMusic className="mr-2" />
                    Tracks ({tracks.length})
                </h3>

                <div className="space-y-4">
                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 shadow-lg overflow-hidden"
                        >
                            {track.audioURL && (
                                <AudioPlayer
                                    audioURL={track.audioURL}
                                    title={track.title}
                                    genre={track.genre}
                                    status={track.status}
                                    uploadedBy={studioName}
                                    uploadedById={studioId}
                                    studioId={studioId}
                                    currentUserId={currentUserId}
                                    currentUserName={currentUserName}
                                    trackId={track.id}
                                    onEdit={() => {
                                        // Artiștii nu pot edita track-urile
                                    }}
                                    onDelete={() => {
                                        // Artiștii nu pot șterge track-urile
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};
