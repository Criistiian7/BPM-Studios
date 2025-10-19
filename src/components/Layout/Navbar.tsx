import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { FiHome, FiUser, FiUsers, FiMic, FiSun, FiMoon, FiSettings, FiLogOut } from "react-icons/fi";
import { getInitials } from "../../utils/formatters";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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

    console.log("Toggling theme from", isDarkMode, "to", newMode);

    // Apply to DOM immediately (sync)
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      console.log("Applied dark mode");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      console.log("Applied light mode");
    }

    // Update state last
    setIsDarkMode(newMode);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.svg"
              alt="BeatPlanner"
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              BeatPlanner
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-2">

            {user && (
              <>
                <Link to="/" className={navLinkClass("/")}>
                  <FiHome className="text-lg" />
                  <span>Home</span>
                </Link>
                <Link to="/profile" className={navLinkClass("/profile")}>
                  <FiUser className="text-lg" />
                  <span>Profil</span>
                </Link>

                <Link to="/community" className={navLinkClass("/community")}>
                  <FiUsers className="text-lg" />
                  <span>Comunitate</span>
                </Link>

                {user.accountType === "producer" && (
                  <Link to="/studio" className={navLinkClass("/studio")}>
                    <FiMic className="text-lg" />
                    <span>Studio</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Side - Theme Toggle & User Menu */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-yellow-100 dark:bg-slate-800 text-yellow-600 dark:text-blue-400 hover:bg-yellow-200 dark:hover:bg-slate-700 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <FiSun className="text-xl" />
              ) : (
                <FiMoon className="text-xl" />
              )}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar Button */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {getInitials(user.name)}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
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
                to="/auth"
                className="px-5 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all font-medium shadow-lg shadow-primary-500/30"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 flex gap-2 overflow-x-auto">
          <Link to="/" className={navLinkClass("/") + " text-sm"}>
            <FiHome />
            <span>Home</span>
          </Link>

          {user && (
            <>
              <Link to="/profile" className={navLinkClass("/profile") + " text-sm"}>
                <FiUser />
                <span>Profil</span>
              </Link>

              <Link to="/community" className={navLinkClass("/community") + " text-sm"}>
                <FiUsers />
                <span>Comunitate</span>
              </Link>

              {user.accountType === "producer" && (
                <Link to="/studio" className={navLinkClass("/studio") + " text-sm"}>
                  <FiMic />
                  <span>Studio</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
