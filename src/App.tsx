import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/authPage";
import Dashboard from "./pages/Dashboard";
import ProfileEdit from "./pages/ProfileEdit";
import Studio from "./pages/Studio";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile-edit" element={<ProfileEdit />} />
      <Route path="/studio" element={<Studio />} />
      {/* alte rute */}
    </Routes>
  );
};

export default App;
