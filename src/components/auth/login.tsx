import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

type Props = { onSwitchToRegister?: () => void };

const Login: React.FC<Props> = ({ onSwitchToRegister }) => {
  const { login, loginDemo } = useAuth();
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

  const handleDemo = async () => {
    setError(null);
    try {
      await loginDemo();
    } catch (err: any) {
      setError(err.message ?? "Demo login failed");
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Bine ai revenit</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full px-3 py-2 border rounded"
        />
        <input
          name="password"
          type="password"
          required
          className="mt-1 w-full px-3 py-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded"
        >
          Logare
        </button>
        <button
          type="button"
          onClick={handleDemo}
          className="w-full mt-2 border border-gray-300 py-2 rounded"
        >
          Continue with demo
        </button>
      </form>
      <p className="mt-4 text-sm">
        Nu ai cont?{" "}
        <button onClick={onSwitchToRegister} className="text-indigo-600">
          Creează cont
        </button>
      </p>
    </div>
  );
};

export default Login;
