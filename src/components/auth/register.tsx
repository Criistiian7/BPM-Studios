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
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Creează cont</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600">Nume</label>
          <input name="name" required 
            className="mt-1 w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Email</label>
          <input name="email" type="email" required 
            className="mt-1 w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Parolă</label>
          <input name="password" type="password" required minLength={6}
            className="mt-1 w-full px-3 py-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Tip cont</label>
          <select name="accountType" defaultValue="artist" 
            className="mt-1 w-full px-3 py-2 border rounded">
            <option value="producer">Producător</option>
            <option value="artist">Artist</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">
        Înregistrare</button>
    </form>
    <p className="mt-4 text-sm">Ai deja cont? <button onClick={onSwitchToLogin}
    className="text-indigo-600">Logare</button></p>
    </div>
  );
};

export default Register;