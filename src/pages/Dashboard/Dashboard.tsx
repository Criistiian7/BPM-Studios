import React from "react";
import { useAuth } from "../../context/authContext";
import { Navigate } from "react-router-dom";
import Tabs from "./Tabs";
import ProfileCard from "./ProfileCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

const Profile: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
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
