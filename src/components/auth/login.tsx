import React, { useState } from "react";
import { useAuth } from "../../context/authContext";
import { FormInput } from "../shared";

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
        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email"
          required
          autoComplete="email"
          placeholder="exemplu@email.com"
        />
        <FormInput
          id="password"
          name="password"
          type="password"
          label="Parolă"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
        <button 
          type="submit" 
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Conectează-te la cont"
        >
          🎵 Conectează-te
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Nu ai cont?{" "}
        <button 
          onClick={onSwitchToRegister} 
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium focus:outline-none focus:underline"
          aria-label="Mergi la pagina de înregistrare"
        >
          Creează cont
        </button>
      </p>
    </div>
  );
};

export default Login;
