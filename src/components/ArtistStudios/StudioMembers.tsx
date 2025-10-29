import React from "react";
import { FiUsers, FiStar, FiPhone, FiMessageCircle } from "react-icons/fi";
import { Card, Avatar, ActionButton } from "../common/CommonComponents";
import type { UserProfile } from "../../types/user";

interface StudioMembersProps {
    members: UserProfile[];
    loading: boolean;
}

/**
 * Componenta StudioMembers - afișează membrii unui studio
 * Componentă simplă pentru gestionarea membrilor
 */
export const StudioMembers: React.FC<StudioMembersProps> = ({
    members,
    loading,
}) => {
    if (loading) {
        return (
            <Card>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <FiUsers className="mr-2" />
                        Membri
                    </h3>
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex items-center space-x-3 animate-pulse">
                                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    if (members.length === 0) {
        return (
            <Card>
                <div className="text-center py-8">
                    <FiUsers className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Nu există membri
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Acest studio nu are membri încă.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FiUsers className="mr-2" />
                    Membri ({members.length})
                </h3>

                <div className="space-y-3">
                    {members.map((member) => {
                        const slug = member.slug || `${member.displayName?.toLowerCase().replace(/\s+/g, '-') || 'user'}-${member.uid.substring(0, 6)}`;

                        return (
                            <div
                                key={member.uid}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                                onClick={() => {
                                    window.open(`/profile/${slug}`, '_blank');
                                }}
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <Avatar
                                        src={member.photoURL}
                                        name={member.displayName || "User"}
                                        size="md"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                            {member.displayName || "User"}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {member.accountType === "producer" ? "Producător" :
                                                member.accountType === "artist" || member.accountType === "Artist" ? "Artist" :
                                                    "Studio"}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                                            <FiStar className="mr-1" />
                                            {member.rating ? member.rating.toFixed(1) : "N/A"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <ActionButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (member.phoneNumber) {
                                                window.open(`tel:${member.phoneNumber}`, '_self');
                                            }
                                        }}
                                        icon={<FiPhone className="w-4 h-4" />}
                                        variant="secondary"
                                        size="sm"
                                        disabled={!member.phoneNumber}
                                        title={member.phoneNumber ? `Sună ${member.displayName}` : "Nu există număr de telefon"}
                                    />
                                    <ActionButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (member.email) {
                                                window.open(`mailto:${member.email}`, '_self');
                                            }
                                        }}
                                        icon={<FiMessageCircle className="w-4 h-4" />}
                                        variant="secondary"
                                        size="sm"
                                        disabled={!member.email}
                                        title={member.email ? `Trimite email la ${member.displayName}` : "Nu există email"}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};
