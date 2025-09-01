// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const ok = login(password);
      if (ok) {
        navigate("/", { replace: true });
      } else {
        setError("Contraseña incorrecta.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full bg-indigo-700/70 rounded-3xl p-9 max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10">
              <img src="/icon_html.ico" alt="Logo" className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-semibold text-white">Segmentacion de Campañas</h1>
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full px-4 py-3 border rounded-lg text-sm bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:bg-white transition-colors ${
                error
                  ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                  : "border-white/50 focus:border-blue-500 focus:ring-blue-200"
              }`}
            />
            {error && (
              <p className="mt-2 text-sm text-red-200">{error}</p>
            )}
          </div>

          <button
            type="submit"
            onClick={onSubmit}
            disabled={submitting || !password.trim()}
            className="w-full bg-white hover:bg-gray-50 text-indigo-700 font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Verificando..." : "Acceder"}
          </button>
        </div>
      </div>
    </div>
  );
}