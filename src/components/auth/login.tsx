import React, { useState } from "react";
import { useAuth } from "../../context/authContext";

type Props = { onSwitchToRegister: () => void };

const Login: React.FC<Props> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-colors">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Bine ai revenit
      </h2>
      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Email
          </label>
          <input 
            id="email"
            name="email" 
            type="email" 
            required 
            autoComplete="email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
            placeholder="exemplu@email.com"
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Parolă
          </label>
          <input 
            id="password"
            name="password" 
            type="password" 
            required 
            autoComplete="current-password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
            placeholder="••••••••"
            aria-required="true"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Conectează-te la cont"
        >
          Logare
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Nu ai cont?{" "}
        <button 
          onClick={onSwitchToRegister} 
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium focus:outline-none focus:underline"
          aria-label="Mergi la pagina de înregistrare"
        >
          Creează cont
        </button>
      </p>
    </div>
  );
};

export default Login;
