import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import type { AccountType } from "../../types/user";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { auth } from "../../firebase";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

type Props = { 
  onSwitchToLogin: () => void;
};

const STORAGE_KEY = "bpm_register_form_data";

const Register: React.FC<Props> = ({ onSwitchToLogin }) => {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Încarcă datele salvate din localStorage la inițializare
  const getInitialFormData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (err) {
      console.error("Error loading saved form data:", err);
    }
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      accountType: "artist" as AccountType,
      location: "",
      phoneNumber: "",
      facebook: "",
      instagram: "",
      youtube: "",
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  // Salvează datele în localStorage la fiecare modificare (exclude parolele pentru securitate)
  useEffect(() => {
    const dataToSave = {
      ...formData,
      password: "", // Nu salvăm parolele în localStorage pentru securitate
      confirmPassword: "",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return "Te rugăm sa introduci numele.";
    if (!formData.lastName.trim()) return "Te rugăm sa introduci numele de familie.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Adresa de email nu este validă.";

    if (formData.password.length < 6) return "Parola trebuie să conțină minim 6 caractere.";

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password))
      return "Parola trebuie să conțină cel puțin un caracter special (!, @, #, $, etc.)";

    if (formData.password !== formData.confirmPassword) return "Parolele nu se potrivesc.";

    if (formData.phoneNumber && !/^[0-9+\-\s()]+$/.test(formData.phoneNumber))
      return "Numărul de telefon nu este valid.";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      await registerUser(formData.email, formData.password, fullName, formData.accountType);

      // 🔹 Corectare Promise + onAuthStateChanged
      const user = await new Promise<any>((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(
          (fbUser) => {
            if (fbUser) {
              unsubscribe();
              resolve(fbUser);
            }
          },
          (err) => reject(err)
        );
      });

      if (user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: formData.email,
            displayName: fullName,
            photoURL: null,
            accountType: formData.accountType,
            rating: 0,
            description: "",
            genre: "",
            location: formData.location.trim(),
            phoneNumber: formData.phoneNumber.trim() || null,
            socialLinks: {
              facebook: formData.facebook.trim() || null,
              instagram: formData.instagram.trim() || null,
              youtube: formData.youtube.trim() || null,
            },
            statistics: { tracksUploaded: 0, projectsCompleted: 0 },
            memberSince: new Date().toISOString(),
            createdAt: new Date(),
          },
          { merge: true }
        );
      }

      alert("✅ Cont creat cu succes! Te rugăm să te autentifici.");
      onSwitchToLogin();
    } catch (err: any) {
      const errorCode = err?.code || "";

      // Traducere completă mesaje Firebase în română
      if (errorCode === "auth/email-already-in-use") {
        setError("Acest email este deja înregistrat. Te rugăm să te autentifici.");
      } else if (errorCode === "auth/invalid-email") {
        setError("Adresa de email nu este validă.");
      } else if (errorCode === "auth/weak-password") {
        setError("Parola este prea slabă. Folosește minim 6 caractere.");
      } else if (errorCode === "auth/network-request-failed") {
        setError("Eroare de conexiune. Verifică internetul și încearcă din nou.");
      } else if (errorCode === "auth/operation-not-allowed") {
        setError("Înregistrarea cu email/parolă nu este activată. Contactează suportul.");
      } else if (errorCode === "auth/too-many-requests") {
        setError("Prea multe încercări eșuate. Te rugăm să aștepți câteva minute.");
      } else if (errorCode === "auth/invalid-password") {
        setError("Parola trebuie să conțină cel puțin 6 caractere.");
      } else if (errorCode === "auth/missing-password") {
        setError("Te rugăm să introduci o parolă.");
      } else if (errorCode === "auth/missing-email") {
        setError("Te rugăm să introduci o adresă de email.");
      } else {
        setError("A apărut o eroare la înregistrare. Te rugăm să încerci din nou.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 transition-all max-h-[92vh] overflow-y-auto custom-scrollbar">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 dark:from-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Creează cont gratuit
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs">
          Alătură-te comunității BeatPlanner
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-xl backdrop-blur-sm" role="alert">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="text-xs">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nume și Prenume */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              👤 Prenume <span className="text-pink-500">*</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
              placeholder="Ion"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              👤 Nume <span className="text-pink-500">*</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
              placeholder="Popescu"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="register-email" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            📧 Email <span className="text-pink-500">*</span>
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
            placeholder="exemplu@email.com"
          />
        </div>

        {/* Parola și Confirmare */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="register-password" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              🔒 Parolă <span className="text-pink-500">*</span>
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              🔒 Confirmă <span className="text-pink-500">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>
        </div>
        <p className="text-[12px] text-gray-600 dark:text-gray-400 -mt-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-lg">
          💡 Min. 6 caractere și un caracter special (!, @, #, $, etc.)
        </p>

        {/* Tip cont și Locație - în aceeași linie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="accountType" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              🎭 Tip cont <span className="text-pink-500">*</span>
            </label>
            <div className="relative">
              <select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 dark:focus:ring-pink-500 focus:border-transparent transition-all shadow-sm appearance-none cursor-pointer pr-10 font-medium hover:border-purple-400 dark:hover:border-pink-400"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a855f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                }}
              >
                <option value="artist" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2">🎤 Artist</option>
                <option value="producer" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2">🎧 Producător</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-purple-500 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              📍 Locație
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
              placeholder="București, România"
            />
          </div>
        </div>

        {/* Telefon */}
        <div>
          <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            📱 Telefon
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 dark:focus:ring-pink-500 focus:border-transparent transition-all shadow-sm"
            placeholder="+40 123 456 789"
          />
        </div>

        {/* Social Media Links - Compact */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-3">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
            <span>🔗</span>
            <span>Social Media (opțional)</span>
          </h3>
          <div className="space-y-2">
            {/* Facebook */}
            <div>
              <label htmlFor="facebook" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <FaFacebook className="text-[#1877F2] text-base" />
                <span>Facebook</span>
              </label>
              <input
                id="facebook"
                name="facebook"
                type="url"
                value={formData.facebook}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all shadow-sm"
                placeholder="https://facebook.com/username"
              />
            </div>

            {/* Instagram */}
            <div>
              <label htmlFor="instagram" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <FaInstagram className="text-[#E4405F] text-base" />
                <span>Instagram</span>
              </label>
              <input
                id="instagram"
                name="instagram"
                type="url"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#E4405F] focus:border-transparent transition-all shadow-sm"
                placeholder="https://instagram.com/username"
              />
            </div>

            {/* YouTube */}
            <div>
              <label htmlFor="youtube" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <FaYoutube className="text-[#FF0000] text-base" />
                <span>YouTube</span>
              </label>
              <input
                id="youtube"
                name="youtube"
                type="url"
                value={formData.youtube}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#FF0000] focus:border-transparent transition-all shadow-sm"
                placeholder="https://youtube.com/@username"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 hover:from-purple-700 hover:via-pink-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Se înregistrează...</span>
              </>
            ) : (
              <>
                <span>🎵</span>
                <span>Înregistrează-te</span>
              </>
            )}
          </span>
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
        <p className="text-xs text-center text-gray-600 dark:text-gray-400">
          Ai deja cont?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-purple-600 dark:text-pink-400 hover:text-purple-700 dark:hover:text-pink-300 font-semibold focus:outline-none focus:underline transition-colors"
          >
            Logare →
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;