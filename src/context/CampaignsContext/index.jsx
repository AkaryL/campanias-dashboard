// ... imports arriba
import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import axios from "axios";

const CampaignsContext = createContext();

export const CampaignsProvider = ({ children }) => {
  const API = import.meta.env.VITE_API_BASE_URL;

  const [routers, setRouters] = useState([]);
  const [loadingRouters, setLoadingRouters] = useState(false);
  const [loadingUpdateRouter, setLoadingUpdateRouter] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
  edad: [],
  genero: [],
  campania: [],
  group_name: [],
});

  // (opcional) snapshot para revertir
  const prevSnapshotRef = useRef([]);

  const fetchRouters = useCallback(async () => {
    setLoadingRouters(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API}/api/v2/campaigns/routers`);
      setRouters(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setRouters([]);
    } finally {
      setLoadingRouters(false);
    }
  }, [API]);

  // Helper: construye el payload COMPLETO que espera el PUT
  const buildRouterPayload = (router, patch = {}) => {
    // Ojo: NO incluir id/created_at/updated_at en el body si tu back no los espera
    const base = {
      serial: router?.serial ?? null,
      mac: router?.mac ?? null,
      device_name: router?.device_name ?? null,
      estacion: router?.estacion ?? null,
      municipio: router?.municipio ?? null,
      latitud: router?.latitud ?? null,
      longitud: router?.longitud ?? null,
      group_name: router?.group_name ?? null,
    };
    return { ...base, ...patch };
  };

  // UPDATE con ID en la URL y BODY completo
  const updateRouter = async (id, patch) => {
    setLoadingUpdateRouter(true);
    setError(null);

    // Encuentra el router actual
    const current = routers.find((r) => r.id === id);
    if (!current) {
      // Si no está en memoria, trae la lista primero
      await fetchRouters();
    }
    const currentAfterFetch = current || routers.find((r) => r.id === id);
    if (!currentAfterFetch) {
      setLoadingUpdateRouter(false);
      throw new Error(`Router ${id} no encontrado para actualizar`);
    }

    // Payload completo requerido por tu PUT
    const payload = buildRouterPayload(currentAfterFetch, patch);

    // Guarda snapshot para revertir si falla
    prevSnapshotRef.current = routers;

    // Optimista (solo lo que cambias)
    setRouters((curr) => curr.map((r) => (r.id === id ? { ...r, ...patch } : r)));

    try {
      const { data } = await axios.put(`${API}/api/v2/campaigns/routers/${id}`, payload);

      // MERGE con lo que responda el back (por si regresa updated_at, etc.)
      setRouters((curr) => curr.map((r) => (r.id === id ? { ...r, ...data } : r)));

      return data;
    } catch (err) {
      // Revertir exactamente
      setRouters(prevSnapshotRef.current);
      setError(err);
      throw err;
    } finally {
      setLoadingUpdateRouter(false);
    }
  };

  return (
    <CampaignsContext.Provider
      value={{
        routers,
        loadingRouters,
        loadingUpdateRouter,
        error,
        fetchRouters,
        updateRouter,
      }}
    >
      {children}
    </CampaignsContext.Provider>
  );
};

export const useCampaigns = () => useContext(CampaignsContext);
