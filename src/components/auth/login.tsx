import React from "react";

type Props= {
  onSwitchToRegister: () => void;
  onDemoLogin?: () => void;
};

const Login: React.FC<Props> = ({ onSwitchToRegister, onDemoLogin }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    console.log("Login submit", { email, password });

  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Bine ai revenit</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium" 
          htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required 
          className="mt-1 w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium" 
            htmlFor="password">Parolă</label>
            <input id="password" name="password" type="password" 
            required minLength={6} className="mt-1 w-full px-3 py-2 border rounded" />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">
          Logare</button>

        <button
          type="button"
          onClick={onDemoLogin}
          className="w-full mt-2 border border-gray-300 text-gray-800 py-2 rounded"
        >
          Continuă cu demo
        </button>
      </form>
      <p className="mt-4 text-sm">
        Nu ai cont?{" "}
        <button type="button" onClick={onSwitchToRegister} className="text-indigo-600">
          Creează cont</button>
      </p>
    </div>
  );
};

export default Login;