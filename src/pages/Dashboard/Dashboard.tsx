import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import ProfileCard from "./ProfileCard";

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
                <ProfileCard />
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="mt-2 text-gray-600">Bine ai venit, {user.name}</p>
            </div>
        </div>
    );    
};

export default Dashboard;