import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/authContext";
import Navbar from "./components/Layout/Navbar";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

// Lazy load pages pentru performanță
const Home = lazy(() => import("./pages/Home"));
const AuthPage = lazy(() => import("./pages/authPage"));
const Profil = lazy(() => import("./pages/Dashboard"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const Studio = lazy(() => import("./pages/Studio"));
const Community = lazy(() => import("./components/community"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

const App: React.FC = () => {
  const { loading } = useAuth();

  // Afișează loader doar la primul check de autentificare
  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<Profil />} />
          <Route path="/profile/:slug" element={<UserProfile />} />
          <Route path="/profile-edit" element={<ProfileEdit />} />
          <Route path="/community" element={<Community />} />
          <Route path="/studio" element={<Studio />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
