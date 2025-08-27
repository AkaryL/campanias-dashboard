import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 sticky top-0 h-screen hidden md:flex flex-col">
        <div className="text-xl font-bold mb-6">Dashboard campañas</div>
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
            to="/campanas"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition ${
                isActive ? "bg-blue-600 text-white" : "hover:bg-slate-100"
              }`
            }
          >
            Campañas
          </NavLink>
        </nav>
        <div className="mt-auto text-xs text-slate-400">v0.1</div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
