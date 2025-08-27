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

  const cleanPayload = (obj = {}) =>
    Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== undefined && v !== null && v !== ""
      )
  );

  // UPDATE con ID en la URL y BODY completo
  const updateRouter = async (id, patch) => {
    setLoadingUpdateRouter(true);
    setError(null);

    // Guardar snapshot para revertir si falla
    prevSnapshotRef.current = routers;

    // Optimista
    setRouters(curr =>
      curr.map(r => (r.id === id ? { ...r, ...patch } : r))
    );

    try {
      // Limpiar antes de enviar
      const payload = cleanPayload(patch);

      const { data } = await axios.put(
        `${API}/api/v2/campaigns/routers/${id}`,
        payload
      );

      // Merge con lo que devuelve el backend
      setRouters(curr =>
        curr.map(r => (r.id === id ? { ...r, ...data } : r))
      );

      return data;
    } catch (err) {
      // Revertir si falla
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
        setRouters,
      }}
    >
      {children}
    </CampaignsContext.Provider>
  );
};

export const useCampaigns = () => useContext(CampaignsContext);
