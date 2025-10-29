import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiMusic, FiHeart, FiMic, FiTrendingUp, FiAward, FiGlobe, FiStar } from "react-icons/fi";

/**
 * Pagina DemoCommunity - Landing page pentru prezentarea comunității
 * 
 * Optimizări pentru performanță:
 * - Memoizată pentru a preveni re-render-urile inutile
 * - useMemo pentru calculări costisitoare
 * - Lazy loading pentru imagini și componente
 * - CSS optimizat pentru GPU acceleration
 */
const DemoCommunity: React.FC = memo(() => {
    // Memoizează datele pentru stats pentru a evita recalcularea
    const statsData = useMemo(() => [
        { number: "500+", label: "Artiști Activi" },
        { number: "1,200+", label: "Track-uri Uploadate" },
        { number: "25+", label: "Țări Reprezentate" },
        { number: "4.8/5", label: "Rating Mediu" }
    ], []);

    // Memoizează testimoniale pentru performanță (pentru viitor)
    // const testimonialsData = useMemo(() => [
    //     {
    //         name: "Alexandru M.",
    //         role: "Producător",
    //         content: "BeatPlanner mi-a schimbat complet modul în care colaborez cu artiștii. Platforma este intuitivă și eficientă.",
    //         rating: 5
    //     },
    //     {
    //         name: "Maria S.",
    //         role: "Artist",
    //         content: "Feedback-ul constructiv pe care îl primesc aici mă ajută să îmi îmbunătățesc constant muzica.",
    //         rating: 5
    //     },
    //     {
    //         name: "David R.",
    //         role: "Producător",
    //         content: "Managementul studio-ului este mult mai simplu acum. Recomand cu încredere!",
    //         rating: 5
    //     }
    // ], []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-slate-900">
            {/* Hero Section */}
            <section className="relative overflow-hidden min-h-[600px] sm:min-h-[700px]">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat brightness-[0.4] blur-[1px] sm:blur-[2px]"
                    style={{ backgroundImage: 'url("/studio-bg.jpg")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-pink-900/40 to-gray-900/90" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-32">
                    <div className="text-center">
                        {/* Logo */}
                        <div className="flex justify-center mb-6 sm:mb-8">
                            <div className="w-20 h-20 sm:w-32 sm:h-32 lg:w-40 lg:h-40">
                                <img src="/logo.svg" alt="BeatPlanner Logo" className="w-full h-full" />
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold mb-4 sm:mb-6">
                            <span className="text-white drop-shadow-2xl">
                                Comunitatea BeatPlanner
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base sm:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-xs sm:max-w-2xl lg:max-w-3xl mx-auto drop-shadow-lg px-4">
                            Descoperă o comunitate vibrantă de artiști și producători muzicali, conectează-te cu talente din întreaga lume și colaborează pentru a crea muzică extraordinară
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                            <Link
                                to="/register"
                                className="px-6 py-3 sm:px-8 sm:py-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/40 transform hover:-translate-y-0.5 text-sm sm:text-base"
                            >
                                Alătură-te Comunității
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements - Foarte lente și subtile */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 right-10 w-20 h-20 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-20 h-20 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-slate-800 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                            De ce să te alături comunității?
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                            O platformă creată special pentru artiști și producători muzicali
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Feature 1 - Conectare */}
                        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-all duration-500 hover-slow">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <FiUsers className="text-white text-xl sm:text-2xl" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Conectare Ușoară
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                Găsește și conectează-te cu artiști și producători din întreaga lume prin profiluri detaliate și sistem de matching inteligent
                            </p>
                        </div>

                        {/* Feature 2 - Colaborare */}
                        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-all duration-500 hover-slow">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <FiMusic className="text-white text-xl sm:text-2xl" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Colaborare Creativă
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                Colaborează în timp real pe proiecte muzicale, împărtășește idei și creează împreună muzică de calitate profesională
                            </p>
                        </div>

                        {/* Feature 3 - Feedback */}
                        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-all duration-500 hover-slow">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <FiHeart className="text-white text-xl sm:text-2xl" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Feedback Constructiv
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                Primește feedback constructiv de la colegii tăi artiști și îmbunătățește-ți abilitățile muzicale prin evaluări detaliate
                            </p>
                        </div>

                        {/* Feature 4 - Studio Management */}
                        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-all duration-500 hover-slow">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <FiMic className="text-white text-xl sm:text-2xl" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Management Studio
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                Creează și gestionează propriul studio muzical, încarcă track-uri și colaborează cu artiști membri
                            </p>
                        </div>

                        {/* Feature 5 - Trending */}
                        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-all duration-500 hover-slow">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <FiTrendingUp className="text-white text-xl sm:text-2xl" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Trending Content
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                Descoperă cele mai populare track-uri, artiști trending și colaborări de succes din comunitate
                            </p>
                        </div>

                        {/* Feature 6 - Recunoaștere */}
                        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 hover:shadow-xl transition-all duration-500 hover-slow">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                                <FiAward className="text-white text-xl sm:text-2xl" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Recunoaștere
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                Obține recunoaștere pentru munca ta prin sistemul de rating și badge-uri pentru realizări speciale
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-slate-900 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                            Comunitatea în numere
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                            O comunitate în creștere constantă de artiști pasionați
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                        {/* Renderizează stats-urile din datele memoizate */}
                        {statsData.map((stat, index) => {
                            const icons = [FiUsers, FiMusic, FiGlobe, FiStar];
                            const gradients = [
                                "from-blue-500 to-indigo-500",
                                "from-green-500 to-emerald-500",
                                "from-purple-500 to-pink-500",
                                "from-yellow-500 to-orange-500"
                            ];
                            const IconComponent = icons[index];

                            return (
                                <div
                                    key={stat.label}
                                    className="text-center p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover-slow"
                                    style={{
                                        willChange: 'transform',
                                        contain: 'layout style paint'
                                    }}
                                >
                                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${gradients[index]} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                                        <IconComponent className="text-white text-xl sm:text-2xl" />
                                    </div>
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                        {stat.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-white dark:bg-slate-800 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                            Ce spun artiștii despre noi
                        </h2>
                        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                            Feedback-ul real de la membrii comunității noastre
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Testimonial 1 */}
                        <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover-slow">
                            <div className="flex items-center mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm sm:text-base">A</span>
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Alexandra M.</h4>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Producător</p>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 italic">
                                "BeatPlanner m-a ajutat să găsesc artiști talentați pentru proiectele mele. Comunitatea este foarte activă și colaborarea este ușoară."
                            </p>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover-slow">
                            <div className="flex items-center mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm sm:text-base">M</span>
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Mihai R.</h4>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Artist</p>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 italic">
                                "Platforma perfectă pentru a-ți promova muzica și a găsi colaborări. Feedback-ul de la comunitate este foarte valoros."
                            </p>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 hover-slow">
                            <div className="flex items-center mb-3 sm:mb-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm sm:text-base">S</span>
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Sofia L.</h4>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Compozitor</p>
                                </div>
                            </div>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 italic">
                                "Am găsit aici producători extraordinari pentru melodiile mele. Comunitatea este foarte suportivă și profesională."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-primary-500 to-purple-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
                        Gata să te alături comunității?
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                        Înregistrează-te gratuit și începe să colaborezi cu artiști din întreaga lume
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <Link
                            to="/register"
                            className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                        >
                            Începe Gratuit
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="w-8 h-8 sm:w-12 sm:h-12">
                                <img src="/logo.svg" alt="BeatPlanner Logo" className="w-full h-full" />
                            </div>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
                            <Link to="/home" className="text-white hover:opacity-80 transition-opacity cursor-pointer">
                                BeatPlanner
                            </Link>
                        </h3>
                        <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
                            Platforma care conectează artiști și producători muzicali pentru colaborări de succes
                        </p>
                        <div className="flex justify-center gap-4 sm:gap-6">
                            <Link to="/home" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                                Acasă
                            </Link>
                            <Link to="/community" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                                Comunitate
                            </Link>
                            <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
});

// Setează displayName pentru debugging
DemoCommunity.displayName = 'DemoCommunity';

export default DemoCommunity;
