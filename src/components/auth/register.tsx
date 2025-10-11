import React, { useState } from "react";
import { useAuth } from "../../context/authContext";
import type { AccountType } from "../../types/user";

type Props = { onSwitchToLogin: () => void };

const Register: React.FC<Props> = ({ onSwitchToLogin }) => {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const accountType = (String(fd.get("accountType") ?? "artist") as AccountType);
    try {
      await registerUser(email, password, name, accountType);
    } catch (err: any) {
      setError(err.message ?? "Register failed");
    }
  };
   

  return (
    <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-colors">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Creează cont
      </h2>
      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Nume
          </label>
          <input 
            id="name"
            name="name" 
            type="text"
            required 
            autoComplete="name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
            placeholder="Numele tău"
            aria-required="true"
          />
        </div>
        <div>
          <label htmlFor="register-email" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Email
          </label>
          <input 
            id="register-email"
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
          <label htmlFor="register-password" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Parolă
          </label>
          <input 
            id="register-password"
            name="password" 
            type="password" 
            required 
            minLength={6}
            autoComplete="new-password"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors" 
            placeholder="Minim 6 caractere"
            aria-required="true"
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Parola trebuie să conțină minim 6 caractere
          </p>
        </div>
        <div>
          <label htmlFor="accountType" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Tip cont
          </label>
          <select 
            id="accountType"
            name="accountType" 
            defaultValue="artist" 
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            aria-label="Selectează tipul de cont"
          >
            <option value="artist">Artist</option>
            <option value="producer">Producător</option>
          </select>
        </div>
        <button 
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Creează cont nou"
        >
          Înregistrare
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Ai deja cont?{" "}
        <button 
          onClick={onSwitchToLogin}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium focus:outline-none focus:underline"
          aria-label="Mergi la pagina de autentificare"
        >
          Logare
        </button>
      </p>
    </div>
  );
};

export default Register;