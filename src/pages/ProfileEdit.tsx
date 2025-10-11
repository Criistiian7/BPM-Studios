import React from "react";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";

const ProfileEdit: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Profil</h2>
      <p className="text-gray-600 mb-4">Editarea profilului a fost dezactivată aici. Folosește viitoarea pagină dedicată profilului.</p>
      <div className="space-y-2">
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-gray-500">{user.email}</div>
        <div className="text-sm">Tip cont: {user.accountType === "producer" ? "Producător" : "Artist"}</div>
        <div className="text-sm">Rating: {user.rating.toFixed(1)}</div>
      </div>
      <div className="mt-4">
        <Link to="/dashboard" className="text-indigo-600">Înapoi la Dashboard</Link>
      </div>
    </div>
  );
};

export default ProfileEdit;
