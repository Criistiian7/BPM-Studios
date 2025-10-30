import React from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiMusic, FiMapPin, FiMail } from "react-icons/fi";
import { Card, Avatar } from "../common/CommonComponents";
import type { Studio as StudioType } from "../../types/studio";

interface StudioCardProps {
    studio: StudioType;
    isSelected: boolean;
    memberCount: number;
    trackCount: number;
    onClick: () => void;
}

/**
 * Componenta StudioCard - afișează informațiile unui studio
 * Componentă simplă și reutilizabilă pentru lista de studio-uri
 */
export const StudioCard: React.FC<StudioCardProps> = ({
    studio,
    isSelected,
    memberCount,
    trackCount,
    onClick,
}) => {
    return (
        <Card
            className={`cursor-pointer transition-all duration-300 ${isSelected
                    ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "hover:shadow-xl hover:-translate-y-1"
                }`}
            onClick={onClick}
            hover={!isSelected}
        >
            <div className="space-y-4">
                {/* Header cu avatar și nume */}
                <div className="flex items-start space-x-4">
                    <Avatar
                        src={studio.photoURL}
                        name={studio.name}
                        size="lg"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {studio.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {studio.description}
                        </p>
                    </div>
                </div>

                {/* Owner Info */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Owner:</span>
                    <Link
                        to={`/profile/${studio.ownerId}`}
                        className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {studio.ownerName || "Loading..."}
                    </Link>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                        <FiUsers className="mr-2" />
                        {memberCount} membri
                    </div>
                    <div className="flex items-center">
                        <FiMusic className="mr-2" />
                        {trackCount} tracks
                    </div>
                </div>

                {/* Location și Contact */}
                {(studio.location || studio.email) && (
                    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {studio.location && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <FiMapPin className="mr-2 flex-shrink-0" />
                                <span className="truncate">{studio.location}</span>
                            </div>
                        )}
                        {studio.email && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <FiMail className="mr-2 flex-shrink-0" />
                                <span className="truncate">{studio.email}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
