import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-xl font-bold">
              BPM
            </Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link to="/tracks" className="text-gray-600 hover:text-gray-900">
              Tracks
            </Link>
            {user?.accountType === "producer" && (
              <Link to="/studio" className="text-gray-600 hover:text-gray-900">
                Studio
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user.name}
                </span>
                <button onClick={logout} className="text-sm text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" className="text-indigo-600">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
