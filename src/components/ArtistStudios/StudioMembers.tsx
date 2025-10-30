import React from "react";
import { FiUsers, FiStar, FiPhone, FiMessageCircle } from "react-icons/fi";
import { Card, Avatar } from "../common/CommonComponents";
import type { UserProfile } from "../../types/user";
import { getAccountTypeLabel } from "../../utils/formatters";

interface StudioMembersProps {
    members: UserProfile[];
    loading: boolean;
    onMemberClick?: (member: UserProfile) => void;
}

/**
 * Componenta StudioMembers - afișează membrii unui studio
 * Componentă simplă pentru gestionarea membrilor
 */
export const StudioMembers: React.FC<StudioMembersProps> = ({
    members,
    loading,
    onMemberClick,
}) => {
    const typeColors = (accountType?: string) => {
        // Culori specifice pentru tipul de cont
        if ((accountType || "").toLowerCase() === "producer") {
            return {
                pill: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-700/40",
                rating: "text-yellow-500",
            } as const;
        }
        // artist (default)
        return {
            pill: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-700/40",
            rating: "text-yellow-500",
        } as const;
    };

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
                        const colors = typeColors(member.accountType);

                        return (
                            <div
                                key={member.uid}
                                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-colors cursor-pointer"
                                onClick={() => {
                                    if (onMemberClick) {
                                        onMemberClick(member);
                                    } else {
                                        window.open(`/profile/${slug}`, '_blank');
                                    }
                                }}
                            >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <Avatar
                                        src={member.photoURL}
                                        name={member.displayName || "User"}
                                        size="md"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                                            {member.displayName || "User"}
                                        </h4>
                                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                                            {/* Tip cont ca pill */}
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${colors.pill}`}>
                                                {getAccountTypeLabel(member.accountType)}
                                            </span>
                                            {/* Rating colorat */}
                                            <span className={`inline-flex items-center gap-1 text-xs ${colors.rating}`}>
                                                <FiStar className="fill-current" />
                                                <span className="font-semibold">{member.rating ? member.rating.toFixed(1) : "N/A"}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Butoane acțiune */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (member.phoneNumber) {
                                                window.open(`tel:${member.phoneNumber}`, '_self');
                                            }
                                        }}
                                        disabled={!member.phoneNumber}
                                        className={`p-2 rounded-lg transition-colors ${member.phoneNumber ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30' : 'text-gray-400 cursor-not-allowed'}`}
                                        title={member.phoneNumber ? `Sună ${member.displayName}` : "Nu există număr de telefon"}
                                    >
                                        <FiPhone className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (member.email) {
                                                window.open(`mailto:${member.email}`, '_self');
                                            }
                                        }}
                                        disabled={!member.email}
                                        className={`p-2 rounded-lg transition-colors ${member.email ? 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30' : 'text-gray-400 cursor-not-allowed'}`}
                                        title={member.email ? `Trimite email la ${member.displayName}` : "Nu există email"}
                                    >
                                        <FiMessageCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};
