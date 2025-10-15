import React, { useState } from "react";
import { useAuth } from "../../context/authContext";
import type { AccountType } from "../../types/user";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { auth } from "../../firebase";
import { FormInput } from "../shared";
import { useFormValidation } from "../../hooks/useFormValidation";
import { registerValidationRules } from "../../utils/validationRules";
import { ACCOUNT_TYPES } from "../../constants";

type Props = { onSwitchToLogin: () => void };

const Register: React.FC<Props> = ({ onSwitchToLogin }) => {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { values, errors, setValue, validate, getFieldError } = useFormValidation({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: ACCOUNT_TYPES.ARTIST as AccountType,
    location: "",
    phoneNumber: "",
    facebook: "",
    instagram: "",
    youtube: "",
  }, registerValidationRules);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;

      await registerUser(values.email, values.password, fullName, values.accountType);

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
            email: values.email,
            displayName: fullName,
            photoURL: null,
            accountType: values.accountType,
            rating: 0,
            description: "",
            genre: "",
            location: values.location.trim(),
            phoneNumber: values.phoneNumber.trim() || null,
            socialLinks: {
              facebook: values.facebook.trim() || null,
              instagram: values.instagram.trim() || null,
              youtube: values.youtube.trim() || null,
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
      if (errorCode === "auth/email-already-in-use")
        setError("Acest email este deja înregistrat. Te rugăm să te autentifici.");
      else if (errorCode === "auth/invalid-email") setError("Adresa de email nu este validă.");
      else if (errorCode === "auth/weak-password")
        setError("Parola este prea slabă. Folosește minim 6 caractere.");
      else if (errorCode === "auth/network-request-failed")
        setError("Eroare de conexiune. Verifică internetul și încearcă din nou.");
      else setError("A apărut o eroare la înregistrare. Te rugăm să încerci din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl transition-colors max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Creează cont</h2>
      {error && (
        <div
          className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nume și Prenume */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="firstName"
            label="Prenume"
            type="text"
            required
            value={values.firstName}
            onChange={(e) => setValue('firstName', e.target.value)}
            error={getFieldError('firstName')}
            placeholder="Ion"
          />
          <FormInput
            id="lastName"
            label="Nume"
            type="text"
            required
            value={values.lastName}
            onChange={(e) => setValue('lastName', e.target.value)}
            error={getFieldError('lastName')}
            placeholder="Popescu"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="register-email" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            placeholder="exemplu@email.com"
          />
        </div>

        {/* Parola și Confirmare */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="register-password" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Parolă <span className="text-red-500">*</span>
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Confirmă Parola <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
          Parola trebuie să conțină minim 6 caractere și cel puțin un caracter special (!, @, #, $, etc.)
        </p>

        {/* Tip cont */}
        <div>
          <label htmlFor="accountType" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
            Tip cont <span className="text-red-500">*</span>
          </label>
          <select
            id="accountType"
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          >
            <option value="artist">Artist</option>
            <option value="producer">Producător</option>
          </select>
        </div>

        {/* Locație și Telefon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Locație
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="București, România"
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Telefon
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              placeholder="+40 123 456 789"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Link-uri Social Media (opțional)</h3>
          <div className="space-y-3">
            {["facebook", "instagram", "youtube"].map((key) => (
              <div key={key}>
                <label htmlFor={key} className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  id={key}
                  name={key}
                  type="url"
                  value={formData[key as keyof typeof formData]}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder={`https://www.${key}.com/username`}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Se înregistrează..." : "🎵 Înregistrează-te"}
        </button>
      </form>

      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        Ai deja cont?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium focus:outline-none focus:underline"
        >
          Logare
        </button>
      </p>
    </div>
  );
};

export default Register;