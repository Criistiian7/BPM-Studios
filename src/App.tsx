import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/authContext";
import { GlobalAudioProvider } from "./context/globalAudioContext";
import Navbar from "./components/Layout/Navbar";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

// Lazy loading optimizat pentru pagini - îmbunătățește performanța aplicației
// Fiecare pagină se încarcă doar când este necesară, cu preloading pentru pagini importante

// Pagini principale - preloadate pentru performanță mai bună
const Home = lazy(() =>
  import("./pages/Home").then(module => {
    // Preload pagini conexe pentru navigare mai rapidă
    import("./pages/DemoCommunity");
    return module;
  })
);

const AuthPage = lazy(() => import("./pages/authPage"));

// Pagini Dashboard - grupate pentru loading mai eficient
const Profil = lazy(() =>
  import("./pages/Dashboard").then(module => {
    // Preload componente conexe
    import("./pages/ProfileEdit");
    return module;
  })
);

const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const Studio = lazy(() => import("./pages/Studio"));
const ArtistStudios = lazy(() => import("./pages/ArtistStudios"));
const Community = lazy(() => import("./components/community"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

// Pagina DemoCommunity - optimizată pentru încărcare rapidă
const DemoCommunity = lazy(() =>
  import("./pages/DemoCommunity").then(module => {
    // Preload pagini conexe pentru navigare mai rapidă
    import("./pages/Home");
    return module;
  })
);

/**
 * Componenta principală a aplicației
 * 
 * Această componentă gestionează:
 * - Rutele aplicației
 * - Starea de autentificare
 * - Loading-ul inițial
 * - Layout-ul general
 */
const App: React.FC = () => {
  // Hook pentru gestionarea autentificării
  const { loading } = useAuth();

  // Afișează loading spinner doar la primul check de autentificare
  // Acest lucru previne "flickering"-ul UI-ului
  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  return (
    <GlobalAudioProvider>
      {/* Bara de navigare - afișată pe toate paginile */}
      <Navbar />

      {/* Container-ul principal pentru pagini */}
      <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
        <Routes>
          {/* Ruta pentru pagina principală */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />

          {/* Rute separate pentru autentificare */}
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />

          {/* Ruta pentru profilul utilizatorului curent */}
          <Route path="/profile" element={<Profil />} />

          {/* Ruta pentru profilul unui utilizator specific (prin slug) */}
          <Route path="/profile/:slug" element={<UserProfile />} />

          {/* Ruta pentru editarea profilului */}
          <Route path="/profile-edit" element={<ProfileEdit />} />

          {/* Ruta pentru comunitate */}
          <Route path="/community" element={<Community />} />

          {/* Ruta pentru demo comunitate - landing page */}
          <Route path="/demo-community" element={<DemoCommunity />} />

          {/* Ruta pentru studio */}
          <Route path="/studio" element={<Studio />} />

          {/* Ruta pentru studiourile artiștilor */}
          <Route path="/artist-studios" element={<ArtistStudios />} />
        </Routes>
      </Suspense>
    </GlobalAudioProvider>
  );
};

export default App;
