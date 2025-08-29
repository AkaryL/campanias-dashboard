// src/pages/Home/index.jsx
import { useEffect } from "react";
import { useCampaigns } from "../../context/CampaignsContext";
import RouterTable from "../../components/RouterTable";

export default function Home() {
  const { routers, loadingRouters, fetchRouters, updateRouter, setRouters } = useCampaigns();

  const handleSaveRouter = async (routerActualizado) => {
    // Optimista
    setRouters(prev =>
      prev.map(r => (r.id === routerActualizado.id ? { ...r, ...routerActualizado } : r))
    );
    try {
      await updateRouter(routerActualizado.id, routerActualizado);
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar el router");
      await fetchRouters(); // revertir/sincronizar
    }
  };

  useEffect(() => {
    fetchRouters();
  }, [fetchRouters]);

  const handleChangeGroup = async (id, newGroupName) => {
    try {
      await updateRouter(id, { group_name: newGroupName });
    } catch (e) {
      alert("No se pudo actualizar el group_name");
    }
  };

  return (
    <section className="min-w-0 w-full max-w-full flex flex-col gap-6">
      <h1 className="text-2xl md:text-3xl font-bold">Home</h1>

      {loadingRouters ? (
        <div className="text-sm text-slate-500">Cargando routers…</div>
      ) : (
        // Contenedor anti-desborde
        <div className="-mx-4 md:mx-0 overflow-x-auto">
          {/* Si quieres también limitar alto y permitir scroll vertical dentro: agrega max-h-[70vh] overflow-y-auto */}
          <div className="inline-block min-w-full align-middle">
            <RouterTable
              routers={routers}
              onSaveRouter={handleSaveRouter}
              onChangeGroup={handleChangeGroup}
            />
          </div>
        </div>
      )}
    </section>
  );
}
