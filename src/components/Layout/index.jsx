import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Sidebar fijo */}
      <aside className="fixed inset-y-0 left-0 w-40 bg-white border-r border-slate-200 p-4 hidden md:flex flex-col">
        <div className="text-xl font-bold mb-6">Dashboard C.</div>
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition ${
                isActive ? "bg-blue-600 text-white" : "hover:bg-slate-100"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/campanias"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition ${
                isActive ? "bg-blue-600 text-white" : "hover:bg-slate-100"
              }`
            }
          >
            Campañas
          </NavLink>
          <NavLink
            to="/segmentacion"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition ${
                isActive ? "bg-blue-600 text-white" : "hover:bg-slate-100"
              }`
            }
          >
            Segmentación
          </NavLink>
        </nav>
      </aside>

      {/* Contenido: ocupa todo el viewport, pero con padding a la izquierda */}
      <main className="min-h-screen w-full md:pl-46 p-6">
        {children}
      </main>
    </div>
  );
}
