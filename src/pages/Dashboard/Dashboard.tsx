import React from "react";
import { useAuth } from "../../context/authContext";
import { Navigate } from "react-router-dom";
import Tabs from "./Tabs";
import ProfileCard from "./ProfileCard";

const Profile: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bine ai venit, {user.name.split(' ')[0]}
          </h1>
        </div>
        
        <ProfileCard />
        
        <Tabs />
      </div>
    </div>
  );
};

export default Profile;
