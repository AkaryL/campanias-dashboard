
// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiLock } from "react-icons/fi";

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white/80 backdrop-blur border border-slate-200 shadow-xl rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-100">
              <FiLock className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">Dashboard campañas</h1>
              <p className="text-sm text-slate-500">Acceso restringido</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Contraseña</label>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••••••"
                className={`px-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring-2 ${
                  error ? "border-red-300 focus:ring-red-200" : "border-slate-300 focus:ring-indigo-200"
                }`}
              />
              {error && <span className="text-[11px] text-red-500">{error}</span>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="mt-4 text-[12px] text-slate-500 text-center">
            Ingresa la contraseña para continuar.
          </p>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center">
          © {new Date().getFullYear()} Dashboard campañas
        </p>
      </div>
    </div>
  );
}
