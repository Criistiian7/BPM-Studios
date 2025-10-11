import React from "react";
import { Link } from "react-router-dom";
import { FiMusic, FiUsers, FiMic, FiTrendingUp, FiHeart, FiZap } from "react-icons/fi";
import { useAuth } from "../context/authContext";

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px]">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/studio-bg.jpg")',
            filter: 'brightness(0.4) blur(2px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-pink-900/40 to-gray-900/90" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 lg:w-40 lg:h-40">
                <img src="/logo.svg" alt="BeatPlanner Logo" className="w-full h-full" />
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-5xl lg:text-7xl font-extrabold mb-6">
              <span className="text-white drop-shadow-2xl">
                BeatPlanner
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto drop-shadow-lg">
              Platforma care conectează artiști și producători muzicali pentru colaborări de succes
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Mergi la Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Începe Gratuit
                  </Link>
                  <Link
                    to="/community"
                    className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border-2 border-indigo-600 dark:border-purple-500 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all shadow-lg"
                  >
                    Explorează Comunitatea
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-20 h-20 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-20 h-20 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              De ce BeatPlanner?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Totul de care ai nevoie pentru a colabora și a crea muzică de calitate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <FiUsers className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Conectează-te cu Artiști
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Găsește și colaborează cu artiști și producători din întreaga lume
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <FiMusic className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Gestionează Track-uri
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Organizează și partajează track-urile tale cu ușurință
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <FiMic className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Studio Virtual
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Accesează studio-ul tău virtual pentru producători
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                <FiTrendingUp className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Crește-ți Cariera
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Construiește-ți portofoliul și rating-ul în comunitate
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <FiHeart className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Comunitate Activă
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Alătură-te unei comunități pasionate de muzică
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <FiZap className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Colaborări Rapide
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Trimite și primește cereri de colaborare instant
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Gata să începi?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Alătură-te comunității BeatPlanner și începe să colaborezi astăzi
          </p>
          {!user && (
            <Link
              to="/auth"
              className="inline-block px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Creează Cont Gratuit
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="BeatPlanner" className="w-8 h-8" />
                <span className="text-xl font-bold">BeatPlanner</span>
              </div>
              <p className="text-gray-400">
                Platforma ta pentru colaborări muzicale
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Link-uri Rapide</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/community" className="hover:text-white transition-colors">Comunitate</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Autentificare</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">
                Email: contact@beatplanner.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} BeatPlanner. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

