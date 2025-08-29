// src/context/CampaignsContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import axios from "axios";

const CampaignsContext = createContext();

export const CampaignsProvider = ({ children }) => {
  const API = import.meta.env.VITE_API_BASE_URL;

  // ========== Routers ==========
  const [routers, setRouters] = useState([]);
  const [loadingRouters, setLoadingRouters] = useState(false);
  const [loadingUpdateRouter, setLoadingUpdateRouter] = useState(false);
  const [creatingRouter, setCreatingRouter] = useState(false);     // 👈 NUEVO
  const [deletingRouterId, setDeletingRouterId] = useState(null);  // ya usado

  const [error, setError] = useState(null);
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

  const cleanPayload = (obj = {}) =>
    Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );

  // CREATE /routers
  const createRouter = async (payload) => {
    setCreatingRouter(true);
    setError(null);
    try {
      // Enviar todos los campos del body que tu API espera
      const body = cleanPayload(payload);
      const { data } = await axios.post(`${API}/api/v2/campaigns/routers`, body);
      setRouters((curr) => [data, ...curr]);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setCreatingRouter(false);
    }
  };

  // UPDATE /routers/:id
  const updateRouter = async (id, patch) => {
    setLoadingUpdateRouter(true);
    setError(null);
    prevSnapshotRef.current = routers;

    // Optimista
    setRouters((curr) => curr.map((r) => (r.id === id ? { ...r, ...patch } : r)));

    try {
      const payload = cleanPayload(patch);
      const { data } = await axios.put(`${API}/api/v2/campaigns/routers/${id}`, payload);
      setRouters((curr) => curr.map((r) => (r.id === id ? { ...r, ...data } : r)));
      return data;
    } catch (err) {
      setRouters(prevSnapshotRef.current);
      setError(err);
      throw err;
    } finally {
      setLoadingUpdateRouter(false);
    }
  };

  // DELETE /routers/:id
  const deleteRouter = async (id) => {
    setDeletingRouterId(id);
    setError(null);
    try {
      await axios.delete(`${API}/api/v2/campaigns/routers/${id}`);
      setRouters((curr) => curr.filter((r) => r.id !== id));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setDeletingRouterId(null);
    }
  };

  // ========== Segments ==========
  const [segments, setSegments] = useState([]);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [creatingSegment, setCreatingSegment] = useState(false);
  const [updatingSegment, setUpdatingSegment] = useState(false);
  const [deletingSegmentId, setDeletingSegmentId] = useState(null);

  const fetchSegments = useCallback(async () => {
    setLoadingSegments(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API}/api/v2/campaigns/segments`);
      setSegments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setSegments([]);
    } finally {
      setLoadingSegments(false);
    }
  }, [API]);

  const createSegment = async (payload) => {
    setCreatingSegment(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API}/api/v2/campaigns/segments`, payload);
      setSegments((curr) => [data, ...curr]);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setCreatingSegment(false);
    }
  };

  const updateSegment = async (id, payload) => {
    setUpdatingSegment(true);
    setError(null);
    try {
      const { data } = await axios.put(`${API}/api/v2/campaigns/segments/${id}`, payload);
      setSegments((curr) => curr.map((s) => (s.id === id ? { ...s, ...data } : s)));
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUpdatingSegment(false);
    }
  };

  const deleteSegment = async (id) => {
    setDeletingSegmentId(id);
    setError(null);
    try {
      await axios.delete(`${API}/api/v2/campaigns/segments/${id}`);
      setSegments((curr) => curr.filter((s) => s.id !== id));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setDeletingSegmentId(null);
    }
  };

  // ========== Campaigns ==========
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [deletingCampaignId, setDeletingCampaignId] = useState(null);
  const [updatingCampaignId, setUpdatingCampaignId] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API}/api/v2/campaigns/campaigns`);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err);
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  }, [API]);

  const createCampaign = async ({ name, description, active, url }) => {
    setCreatingCampaign(true);
    setError(null);
    try {
      const payload = { name, description, active, url };
      const { data } = await axios.post(`${API}/api/v2/campaigns/campaigns`, payload);
      setCampaigns((curr) => [data, ...curr]);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setCreatingCampaign(false);
    }
  };

  const updateCampaign = async (id, { name, description, active, url }) => {
    setUpdatingCampaignId(id);
    setError(null);
    try {
      const payload = { name, description, active, url };
      const { data } = await axios.put(`${API}/api/v2/campaigns/campaigns/${id}`, payload);
      setCampaigns((curr) => curr.map((c) => (c.id === id ? { ...c, ...data } : c)));
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setUpdatingCampaignId(null);
    }
  };

  const deleteCampaign = async (id) => {
    setDeletingCampaignId(id);
    setError(null);
    try {
      await axios.delete(`${API}/api/v2/campaigns/campaigns/${id}`);
      setCampaigns((curr) => curr.filter((c) => c.id !== id));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setDeletingCampaignId(null);
    }
  };

  return (
    <CampaignsContext.Provider
      value={{
        // routers
        routers,
        loadingRouters,
        loadingUpdateRouter,
        creatingRouter,   // 👈 export
        deletingRouterId, // 👈 export
        fetchRouters,
        createRouter,     // 👈 export
        updateRouter,
        deleteRouter,
        setRouters,

        // segments
        segments,
        loadingSegments,
        creatingSegment,
        updatingSegment,
        deletingSegmentId,
        fetchSegments,
        createSegment,
        updateSegment,
        deleteSegment,

        // campaigns
        campaigns,
        loadingCampaigns,
        creatingCampaign,
        deletingCampaignId,
        updatingCampaignId,
        fetchCampaigns,
        createCampaign,
        updateCampaign,
        deleteCampaign,

        error,
      }}
    >
      {children}
    </CampaignsContext.Provider>
  );
};

export const useCampaigns = () => useContext(CampaignsContext);
