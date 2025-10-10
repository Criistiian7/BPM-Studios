import React from "react";
import { useAuth } from "../../context/authContext";
import { Navigate } from "react-router-dom";
import Tabs from "./Tabs";
import ProfileCard from "./ProfileCard";

const Dashboard: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <ProfileCard />
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">Bine ai venit, {user.name}</p>
        <div>
          <Tabs />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
