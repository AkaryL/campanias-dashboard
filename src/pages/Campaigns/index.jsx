import { useEffect, useMemo, useState } from "react";
import { useCampaigns } from "../../context/CampaignsContext";
import GroupFormModal from "../../components/GroupFormModal";

export default function Campaigns() {
  const {
    routers,
    fetchRouters,
    options: ctxOptions = {}, // 👈 default para evitar undefined
    fetchOptions,
  } = useCampaigns();

  // 👇 Normaliza opciones aunque ctxOptions venga undefined/null
  const options = useMemo(() => ({
    edad: ctxOptions?.edad ?? [],
    genero: ctxOptions?.genero ?? [],
    campania: ctxOptions?.campania ?? [],
    group_name: ctxOptions?.group_name ?? [],
  }), [ctxOptions]);

  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchRouters();
    fetchOptions?.(); // si existe
  }, [fetchRouters, fetchOptions]);

  const stats = useMemo(() => {
    const acc = {};
    for (const r of routers) {
      const key = r.group_name || "—";
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, [routers]);

  const handleCreateGroup = (values) => {
    // Aquí de momento solo guardamos en frontend (hasta que tengas endpoint real de "grupos")
    setGroups((prev) => [{ id: crypto.randomUUID(), ...values }, ...prev]);
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Campañas</h1>
          <p className="text-slate-500">Crea grupos (segmentos) y visualiza los existentes.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          + Crear nuevo grupo
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([group, count]) => (
          <div key={group} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <div className="text-sm text-slate-500">Group {group}</div>
            <div className="text-3xl font-bold">{count}</div>
            <div className="text-xs text-slate-400 mt-1">routers asignados</div>
          </div>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-400">
          No hay ninguno.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <article key={g.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
              <h3 className="text-lg font-semibold">{g.nombre}</h3>
              <div className="text-sm text-slate-600"><b>Edad:</b> {g.edad}</div>
              <div className="text-sm text-slate-600"><b>Género:</b> {g.genero}</div>
              <div className="text-sm text-slate-600"><b>Campaña:</b> {g.campania}</div>
              <div className="text-sm text-slate-600"><b>Group routers:</b> {g.group_name}</div>
            </article>
          ))}
        </div>
      )}

       <GroupFormModal
        open={open}
        onClose={() => setOpen(false)}
        onCreate={(values)=> setGroups(prev => [{ id: crypto.randomUUID(), ...values }, ...prev])}
        options={{
          edad: options.edad,
          genero: options.genero,
          campania: options.campania,
          group: options.group_name,
        }}
        loadingOptions={false}
      />
    </section>
  );
}
