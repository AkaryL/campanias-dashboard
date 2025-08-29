// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Campaigns from "./pages/Campaigns";
import Segmentacion from "./pages/Segmentacion";
import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

function RequireAuth() {
  const { authed } = useAuth();
  if (!authed) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// Shell para que el Layout envuelva a las rutas protegidas
function Shell() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function RedirectIfAuthed() {
  const { authed } = useAuth();
  return authed ? <Navigate to="/" replace /> : <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<RedirectIfAuthed />} />

        {/* Protegidas */}
        <Route element={<RequireAuth />}>
          <Route element={<Shell />}>
            <Route path="/" element={<Home />} />
            <Route path="/campanias" element={<Campaigns />} />
            <Route path="/segmentacion" element={<Segmentacion />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
