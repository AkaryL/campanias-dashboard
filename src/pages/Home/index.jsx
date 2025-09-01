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
    <section className="min-w-0 w-full max-w-full flex flex-col gap-6 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Routers</h1>

      {loadingRouters ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-500">Cargando routers…</span>
        </div>
      ) : (
        // Contenedor anti-desborde
        <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
          <div className="min-w-full">
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