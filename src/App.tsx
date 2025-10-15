import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/authContext";
import Navbar from "./components/Layout/Navbar";

// Lazy load pages pentru performanță
const Home = lazy(() => import("./pages/Home"));
const AuthPage = lazy(() => import("./pages/authPage"));
const Profil = lazy(() => import("./pages/Dashboard"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const Studio = lazy(() => import("./pages/Studio"));
const Community = lazy(() => import("./components/community"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

// Loading component modern
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 dark:border-t-pink-500 animate-spin"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">Se încarcă...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const { loading } = useAuth();

  // Afișează loader doar la primul check de autentificare
  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}>
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
