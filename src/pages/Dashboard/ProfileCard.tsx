import React from "react";
import { useAuth } from "../../context/AuthContext";

const ProfileCard: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="big-white p-6 rounded shadow flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center
            justify-center text-xl font-semibold text-gray-700">
                {user.name.split(" ").map(n => n[0]).slice(0,2).join("")}
            </div>
            <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-3">
                    <button className="px-3 py-1 bg-indigo-600 text-white rounded">
                    Editează profilul
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;