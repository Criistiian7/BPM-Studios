import React from "react";
import { useAuth } from "../../context/authContext";

const ProfileCard: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white p-6 rounded shadow flex items-center space-x-6">
      <div
        className="w-20 h-20 rounded-full bg-gray-200 flex items-center
            justify-center text-xl font-semibold text-gray-700"
      >
        {user.name
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")}
      </div>
      <div>
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-sm text-gray-500">{user.email}</p>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5">
            {user.accountType === "producer" ? "Producător" : "Artist"}
          </span>
          <span className="inline-flex items-center text-yellow-600">
            ★ {user.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
