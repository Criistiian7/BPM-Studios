import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";

type Props = { onSwitchToRegister: () => void };

const STORAGE_KEY = "bpm_login_email";

const Login: React.FC<Props> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  // Încarcă email-ul salvat la inițializare
  useEffect(() => {
    const savedEmail = localStorage.getItem(STORAGE_KEY);
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Salvează email-ul la fiecare modificare
  useEffect(() => {
    if (email) {
      localStorage.setItem(STORAGE_KEY, email);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const emailValue = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    try {
      await login(emailValue, password);
      // Șterge email-ul salvat după login reușit
      localStorage.removeItem(STORAGE_KEY);
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code || "";

      // Traducere mesaje Firebase în română
      if (errorCode === "auth/invalid-credential") {
        setError("Email sau parolă incorectă. Te rugăm să încerci din nou.");
      } else if (errorCode === "auth/user-not-found") {
        setError("Nu există un cont cu acest email. Te rugăm să te înregistrezi.");
      } else if (errorCode === "auth/wrong-password") {
        setError("Parolă incorectă. Te rugăm să încerci din nou.");
      } else if (errorCode === "auth/invalid-email") {
        setError("Adresa de email nu este validă.");
      } else if (errorCode === "auth/user-disabled") {
        setError("Acest cont a fost dezactivat. Contactează suportul.");
      } else if (errorCode === "auth/network-request-failed") {
        setError("Eroare de conexiune. Verifică internetul și încearcă din nou.");
      } else if (errorCode === "auth/too-many-requests") {
        setError("Prea multe încercări eșuate. Te rugăm să aștepți câteva minute.");
      } else {
        setError("A apărut o eroare la autentificare. Te rugăm să încerci din nou.");
      }
    }
  }

  return (
    <div className="w-full max-w-lg sm:max-w-md p-4 sm:p-6 lg:p-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 transition-all">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Bine ai revenit!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
          Conectează-te pentru a continua
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-xl backdrop-blur-sm" role="alert">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            📧 Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
            placeholder="exemplu@email.com"
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
            🔒 Parolă
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-lg sm:rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
            placeholder="••••••••"
            aria-required="true"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 hover:from-purple-700 hover:via-pink-600 hover:to-indigo-700 text-white font-bold py-3 sm:py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 text-sm sm:text-base"
          aria-label="Conectează-te la cont"
        >
          <span className="flex items-center justify-center gap-2">
            <span>🎵</span>
            <span>Conectează-te</span>
          </span>
        </button>
      </form>

      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <p className="text-xs sm:text-sm text-center text-gray-600 dark:text-gray-400">
          Nu ai cont?{" "}
          <button
            onClick={onSwitchToRegister}
            className="text-purple-600 dark:text-pink-400 hover:text-purple-700 dark:hover:text-pink-300 font-semibold focus:outline-none focus:underline transition-colors"
            aria-label="Mergi la pagina de înregistrare"
          >
            Creează cont gratuit →
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
