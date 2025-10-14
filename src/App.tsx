import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import AuthPage from "./pages/authPage";
import Profil from "./pages/Dashboard";
import ProfileEdit from "./pages/ProfileEdit";
import Studio from "./pages/Studio";
import Navbar from "./components/Layout/Navbar";
import Community from "./components/community";
import UserProfile from "./pages/UserProfile";

const App: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";

  return (
    <>
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<Profil />} />
        <Route path="/profile" element={<Profil />} />
        <Route path="/profile/:slug" element={<UserProfile />} />
        <Route path="/profile-edit" element={<ProfileEdit />} />
        <Route path="/community" element={<Community />} />
        <Route path="/studio" element={<Studio />} />
      </Routes>
    </>
  );
};

export default App;
