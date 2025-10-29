import React from "react";
import { Link } from "react-router-dom";
import { FiMusic, FiUsers, FiMic, FiTrendingUp, FiHeart, FiZap } from "react-icons/fi";
import { useAuth } from "../context/authContext";

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-slate-900">
      {/* Hero Section - Design Modern și Elegant */}
      <section className="relative overflow-hidden min-h-[600px] sm:min-h-[700px] lg:min-h-[800px]">
        {/* Modern Background with Glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
        <div className="absolute inset-0 bg-[url('/studio-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-20" />

        {/* Modern Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />

        {/* Floating Elements - Modern Design */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            {/* Modern Logo with Glow Effect */}
            <div className="flex justify-center mb-8 sm:mb-12">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 shadow-2xl group-hover:shadow-purple-500/25 transition-all duration-500 flex items-center justify-center">
                  <img src="/logo.svg" alt="BeatPlanner Logo" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 filter drop-shadow-lg" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Modern Title with Gradient Text */}
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-6 sm:mb-8">
              <Link
                to="/home"
                className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl hover:from-purple-300 hover:via-pink-300 hover:to-white transition-all duration-500 cursor-pointer"
              >
                BeatPlanner
              </Link>
            </h1>

            {/* Modern Subtitle with Better Typography */}
            <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-12 max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto px-4 font-light leading-relaxed">
              Platforma care conectează artiști și producători muzicali pentru colaborări de succes
            </p>

            {/* Modern CTA Buttons with Glassmorphism */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
              {user ? (
                <Link
                  to="/profile"
                  className="group relative px-8 py-4 sm:px-12 sm:py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg sm:text-xl font-bold rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                  <span className="relative z-10">Începe Acum →</span>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="group relative px-8 py-4 sm:px-10 sm:py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 text-base sm:text-lg"
                  >
                    <span className="relative z-10">Începe Gratuit</span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                  <Link
                    to="/demo-community"
                    className="group relative px-8 py-4 sm:px-10 sm:py-5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-base sm:text-lg"
                  >
                    <span className="relative z-10">Explorează Comunitatea</span>
                    <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Design Modern cu Glassmorphism */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                De ce BeatPlanner?
              </span>
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto px-4 font-light leading-relaxed">
              Totul de care ai nevoie pentru a colabora și a crea muzică de calitate
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Feature 1 - Modern Glassmorphism Card */}
            <div className="group relative p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:border-purple-300/50 dark:hover:border-purple-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all duration-300">
                  <FiUsers className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  Conectează-te cu Artiști
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">
                  Găsește și colaborează cu artiști și producători din întreaga lume
                </p>
              </div>
            </div>

            {/* Feature 2 - Modern Glassmorphism Card */}
            <div className="group relative p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:border-pink-300/50 dark:hover:border-pink-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/40 transition-all duration-300">
                  <FiMusic className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-300">
                  Gestionează Track-uri
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">
                  Organizează și partajează track-urile tale cu ușurință
                </p>
              </div>
            </div>

            {/* Feature 3 - Modern Glassmorphism Card */}
            <div className="group relative p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300">
                  <FiMic className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  Studio Virtual
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">
                  Accesează studio-ul tău virtual pentru producători
                </p>
              </div>
            </div>

            {/* Feature 4 - Modern Glassmorphism Card */}
            <div className="group relative p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:border-orange-300/50 dark:hover:border-orange-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all duration-300">
                  <FiTrendingUp className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                  Crește-ți Cariera
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">
                  Construiește-ți portofoliul și rating-ul în comunitate
                </p>
              </div>
            </div>

            {/* Feature 5 - Modern Glassmorphism Card */}
            <div className="group relative p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:border-green-300/50 dark:hover:border-green-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 transition-all duration-300">
                  <FiHeart className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                  Comunitate Activă
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">
                  Alătură-te unei comunități pasionate de muzică
                </p>
              </div>
            </div>

            {/* Feature 6 - Modern Glassmorphism Card */}
            <div className="group relative p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/20 dark:border-slate-700/50 hover:border-red-300/50 dark:hover:border-red-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40 transition-all duration-300">
                  <FiZap className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                  Colaborări Rapide
                </h3>
                <p className="text-sm sm:text-base text-gray-700 dark:text-white leading-relaxed">
                  Trimite și primește cereri de colaborare instant
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Design Modern cu Gradient */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Modern Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/studio-bg.jpg')] bg-cover bg-center opacity-10"></div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full blur-xl animate-pulse animation-delay-4000"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 sm:mb-8">
            Gata să începi?
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-12 px-4 font-light leading-relaxed">
            Alătură-te comunității BeatPlanner și începe să colaborezi astăzi
          </p>
          {!user && (
            <Link
              to="/register"
              className="group relative inline-block px-8 py-4 sm:px-12 sm:py-5 bg-white text-purple-600 font-bold rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 text-lg sm:text-xl"
            >
              <span className="relative z-10">Creează Cont Gratuit</span>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          )}
        </div>
      </section>

      {/* Footer - Design Modern cu Glassmorphism */}
      <footer className="bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-white py-12 sm:py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            <div className="space-y-4">
              <Link to="/home" className="flex items-center gap-3 mb-4 sm:mb-6 hover:opacity-80 transition-opacity group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                  <img src="/logo.svg" alt="BeatPlanner" className="w-5 h-5 sm:w-6 sm:h-6 filter brightness-0 invert" />
                </div>
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BeatPlanner
                </span>
              </Link>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Platforma ta pentru colaborări muzicale
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold mb-4 sm:mb-6 text-lg sm:text-xl text-gray-900 dark:text-white">Link-uri Rapide</h3>
              <ul className="space-y-3 text-sm sm:text-base">
                <li>
                  <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">
                    Profil
                  </Link>
                </li>
                <li>
                  <Link to="/community" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">
                    Comunitate
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">
                    Autentificare
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-bold mb-4 sm:mb-6 text-lg sm:text-xl text-gray-900 dark:text-white">Contact</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Email: contact@beatplanner.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-300 dark:border-gray-700 mt-8 sm:mt-12 pt-8 sm:pt-10 text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
            <p>&copy; {new Date().getFullYear()} BeatPlanner. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

