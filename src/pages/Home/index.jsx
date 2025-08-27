// src/pages/Home/index.jsx
import { useEffect } from "react";
import { useCampaigns } from "../../context/CampaignsContext";
import RouterTable from "../../components/RouterTable";

export default function Home() {
  const { routers, loadingRouters, fetchRouters, updateRouter } = useCampaigns();

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
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl md:text-3xl font-bold">Home</h1>
      {loadingRouters ? (
        <div className="text-sm text-slate-500">Cargando routers…</div>
      ) : (
        <RouterTable routers={routers} onChangeGroup={handleChangeGroup} />
      )}
    </section>
  );
}
