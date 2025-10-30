import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { FiUser, FiUsers, FiMic, FiSun, FiMoon, FiSettings, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { getInitials, isProducer, isArtist } from "../../utils/formatters";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when route changes or when user logs out
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, user]);

  // Load theme preference from localStorage and apply immediately
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    // Apply to HTML first
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Then update state
    setIsDarkMode(shouldBeDark);
  }, []);

  const toggleTheme = () => {
    // Calculate new mode
    const newMode = !isDarkMode;


    // Apply to DOM immediately (sync)
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    // Update state last
    setIsDarkMode(newMode);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate("/home");
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => `
    flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium
    ${isActive(path)
      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
    }
  `;

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo - Responsive sizing, clickable pentru a naviga către Home */}
          <Link to="/home" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/logo.svg"
              alt="BeatPlanner"
              className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
            />
            <span className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">
              BeatPlanner
            </span>
          </Link>

          {/* Navigation Links - Ascunse pe mobile, fără Home după logare */}
          <div className="hidden lg:flex items-center space-x-2">

            {user && (
              <>
                <Link to="/profile" className={navLinkClass("/profile")}>
                  <FiUser className="text-lg" />
                  <span>Profil</span>
                </Link>

                <Link to="/community" className={navLinkClass("/community")}>
                  <FiUsers className="text-lg" />
                  <span>Comunitate</span>
                </Link>

                {/* Butonul Studio - vizibil doar pentru producători */}
                {isProducer(user.accountType) && (
                  <Link to="/studio" className={navLinkClass("/studio")}>
                    <FiMic className="text-lg" />
                    <span>Studio</span>
                  </Link>
                )}

                {/* Butonul Studio Connect - vizibil pentru artiști și producători */}
                {(isProducer(user.accountType) || isArtist(user.accountType)) && (
                  <Link to="/studio-connect" className={navLinkClass("/studio-connect")}>
                    <FiMic className="text-lg" />
                    <span>Studio Connect</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side - Theme Toggle, Mobile Menu & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button - Responsive sizing */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-full bg-yellow-100 dark:bg-slate-800 text-yellow-600 dark:text-blue-400 hover:bg-yellow-200 dark:hover:bg-slate-700 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <FiSun className="text-lg sm:text-xl" />
              ) : (
                <FiMoon className="text-lg sm:text-xl" />
              )}
            </button>

            {/* Mobile Menu Button - Vizibil doar pe mobile și când utilizatorul este logat */}
            {user && (
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all touch-manipulation"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <FiX className="text-xl" />
                ) : (
                  <FiMenu className="text-xl" />
                )}
              </button>
            )}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar Button - Responsive sizing */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-1 sm:gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                      {getInitials(user.name)}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu - Responsive sizing */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        @{user.email.split("@")[0]}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiUser className="text-lg" />
                        <span>Profilul Meu</span>
                      </Link>

                      <Link
                        to="/profile-edit"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiSettings className="text-lg" />
                        <span>Setări</span>
                      </Link>
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <FiLogOut className="text-lg" />
                        <span>Deconectare</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 bg-primary-500 text-white rounded-lg sm:rounded-xl hover:bg-primary-600 transition-all font-medium shadow-lg shadow-primary-500/30 text-xs sm:text-sm lg:text-base"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu - Modern collapse design cu animații smooth - doar pentru utilizatori logați */}
        {user && (
          <div className={`lg:hidden transition-all duration-1000 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
            <div className="py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 backdrop-blur-sm">
              <div className="flex flex-col space-y-1 px-2">
                <>
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 transform hover:scale-105 touch-manipulation ${location.pathname === "/profile"
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md"
                      }`}
                  >
                    <FiUser className="text-lg" />
                    <span className="font-medium">Profil</span>
                  </Link>

                  <Link
                    to="/community"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 transform hover:scale-105 touch-manipulation ${location.pathname === "/community"
                      ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md"
                      }`}
                  >
                    <FiUsers className="text-lg" />
                    <span className="font-medium">Comunitate</span>
                  </Link>

                  {/* Butonul Studio - vizibil doar pentru producători */}
                  {isProducer(user.accountType) && (
                    <Link
                      to="/studio"
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 transform hover:scale-105 touch-manipulation ${location.pathname === "/studio"
                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md"
                        }`}
                    >
                      <FiMic className="text-lg" />
                      <span className="font-medium">Studio</span>
                    </Link>
                  )}

                  {/* Butonul Studio Connect - vizibil pentru artiști și producători */}
                  {(isProducer(user.accountType) || isArtist(user.accountType)) && (
                    <Link
                      to="/studio-connect"
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-500 transform hover:scale-105 touch-manipulation ${location.pathname === "/studio-connect"
                        ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:shadow-md"
                        }`}
                    >
                      <FiMic className="text-lg" />
                      <span className="font-medium">Studio Connect</span>
                    </Link>
                  )}
                </>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
