import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import Dashboard from "./dashboard";
import Profile from "./profile";
import Login from "./auth/login";
import Register from "./auth/register";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [user] = useAuthState(auth);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout failed", error);
      alert("Logout failed: " + error);
    }
  };

  if (
    !user &&
    location.pathname !== "/login" &&
    location.pathname !== "/register"
  ) {
    return <Navigate to="/login" />;
  }
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            BeatPlanner
          </Link>
          <ul className="flex items-center space-x-6">
            {user ? (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/community"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-700"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main className="container mx-auto mt-4 flex-grow">{children}</main>

      <footer className="bg-gray-100 text-center py-4">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} BeatPlanner
        </p>
      </footer>
    </div>
  );
}

export default Layout;
