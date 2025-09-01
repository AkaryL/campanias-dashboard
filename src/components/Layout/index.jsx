import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
      {/* Sidebar fijo */}
      <aside className="fixed inset-y-0 left-0 w-42 bg-indigo-900 text-white p-6 hidden md:flex flex-col shadow-lg">
        <div className="text-xl font-bold mb-8 text-white flex items-center space-x-2">
          <img src="/public/icon_html.ico" alt="Logo" className="w-5 h-5 text-white" />
          <span className="text-[20px]">Campañas</span>
        </div>
        <nav className="flex flex-col gap-1">
          <div className="text-xs font-medium text-indigo-300 uppercase tracking-wider mb-3">Dashboard</div>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive ? "bg-indigo-800 text-white" : "text-indigo-200 hover:text-white hover:bg-indigo-800"
              }`
            }
          >
            Inicio
          </NavLink>
          <NavLink
            to="/campanias"
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive ? "bg-indigo-800 text-white" : "text-indigo-200 hover:text-white hover:bg-indigo-800"
              }`
            }
          >
            Campañas
          </NavLink>
          <NavLink
            to="/segmentacion"
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive ? "bg-indigo-800 text-white" : "text-indigo-200 hover:text-white hover:bg-indigo-800"
              }`
            }
          >
            Segmentacion
          </NavLink>
        </nav>
      </aside>

      {/* Contenido: ocupa todo el viewport, pero con padding a la izquierda */}
      <main className="min-h-screen w-full md:pl-42 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}