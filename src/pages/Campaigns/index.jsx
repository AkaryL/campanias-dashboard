// src/pages/Campaigns/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiArrowUp,
  FiArrowDown,
  FiEdit,
  FiTrash2,
  FiLink,
  FiCalendar,
  FiAlertTriangle,
} from "react-icons/fi";
import { useCampaigns } from "../../context/CampaignsContext";

function Campaigns() {
  const {
    campaigns,
    loadingCampaigns,
    fetchCampaigns,
    createCampaign,
    creatingCampaign,
    deleteCampaign,
    deletingCampaignId,
    updateCampaign,
    updatingCampaignId,
  } = useCampaigns();

  useEffect(() => {
    fetchCampaigns?.();
  }, [fetchCampaigns]);

  // --- UI state ---
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all"); // all | active | inactive
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc"); // asc | desc
  const toggleDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  const sortOptions = [
    { value: "name", label: "Nombre" },
    { value: "created_at", label: "Creado" },
    { value: "updated_at", label: "Actualizado" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (campaigns || [])
      .filter((c) => {
        if (status === "active") return c.active;
        if (status === "inactive") return !c.active;
        return true;
      })
      .filter((c) =>
        q
          ? [c.name, c.description, c.url]
              .map((x) => (x ?? "").toLowerCase())
              .some((t) => t.includes(q))
          : true
      );
  }, [campaigns, query, status]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    const getStr = (s) => (s ?? "").toString();
    const getDateMs = (iso) => new Date(iso).getTime();
    const arr = [...filtered];
    arr.sort((a, b) => {
      let res = 0;
      switch (sortKey) {
        case "name":
          res = getStr(a.name).localeCompare(getStr(b.name), "es", {
            sensitivity: "base",
          });
          break;
        case "created_at":
          res = getDateMs(a.created_at) - getDateMs(b.created_at);
          break;
        case "updated_at":
          res = getDateMs(a.updated_at) - getDateMs(b.updated_at);
          break;
        default:
          res = 0;
      }
      return res * dir;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // --- Modal crear (API) ---
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    url: "",
    active: true,
  });
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const resetForm = () =>
    setForm({ name: "", description: "", url: "", active: true });

  const onCreate = async () => {
    if (!form.name.trim()) return alert("Nombre requerido");
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      active: !!form.active,
      url:
        form.url.trim() ||
        form.name.trim().toLowerCase().replace(/\s+/g, "-"),
    };
    try {
      await createCampaign(payload);
      resetForm();
      setOpenCreate(false);
    } catch (e) {
      alert("No se pudo crear la campaña");
      console.error(e);
    }
  };

  // --- Modal confirm delete ---
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const openConfirmDelete = (c) => {
    setConfirmTarget(c);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };
  const onConfirmDelete = async () => {
    if (!confirmTarget) return;
    try {
      await deleteCampaign(confirmTarget.id);
      closeConfirm();
    } catch {
      alert("No se pudo eliminar la campaña");
    }
  };

  // --- Modal editar ---
  const [openEdit, setOpenEdit] = useState(false);
  const [edit, setEdit] = useState({
    id: null,
    name: "",
    description: "",
    url: "",
    active: true,
  });
  const setEditField = (k, v) => setEdit((p) => ({ ...p, [k]: v }));

  const openEditModal = (c) => {
    setEdit({
      id: c.id,
      name: c.name ?? "",
      description: c.description ?? "",
      url: c.url ?? "",
      active: !!c.active,
    });
    setOpenEdit(true);
  };
  const onSaveEdit = async () => {
    if (!edit.name.trim()) return alert("Nombre requerido");
    const payload = {
      name: edit.name.trim(),
      description: edit.description.trim(),
      url: edit.url.trim(),
      active: !!edit.active,
    };
    try {
      await updateCampaign(edit.id, payload);
      setOpenEdit(false);
    } catch (e) {
      alert("No se pudo actualizar la campaña");
      console.error(e);
    }
  };

  return (
    <section className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Campañas</h1>
          <p className="text-slate-500">Crea y gestiona tus campañas.</p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          <FiPlus />
          Nueva campaña
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="pl-9 pr-3 py-2 w-72 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por nombre, descripción o slug…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Estado"
        >
          <option value="all">Todas</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm text-slate-600">Ordenar por:</label>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleDir}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50"
            title="Cambiar dirección"
          >
            {sortDir === "asc" ? <FiArrowUp /> : <FiArrowDown />}
            <span className="text-sm">{sortDir === "asc" ? "Asc" : "Desc"}</span>
          </button>
        </div>
      </div>

      {/* Grid de cards */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
        {loadingCampaigns ? (
          <div className="text-slate-400">Cargando campañas…</div>
        ) : sorted.length === 0 ? (
          <div className="text-slate-400">No hay campañas que coincidan.</div>
        ) : (
          sorted.map((c) => (
            <CampaignCard
              key={c.id}
              c={c}
              onAskDelete={() => openConfirmDelete(c)}
              onAskEdit={() => openEditModal(c)}
              deleting={deletingCampaignId === c.id}
              updating={updatingCampaignId === c.id}
            />
          ))
        )}
      </div>

      {/* Modal crear (con API) */}
      {openCreate && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenCreate(false)}
          />
          <div className="relative z-[121] w-full max-w-xl mx-4 rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Nueva campaña</h3>
              <button
                className="px-2 py-1 rounded-lg hover:bg-slate-100"
                onClick={() => setOpenCreate(false)}
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 gap-4">
              <Field
                label="Nombre"
                value={form.name}
                onChange={(v) => setField("name", v)}
              />
              <Field
                label="Descripción"
                value={form.description}
                onChange={(v) => setField("description", v)}
                textarea
              />
              <Field
                label="Slug (URL)"
                value={form.url}
                onChange={(v) => setField("url", v)}
                placeholder="mi-campania"
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setField("active", e.target.checked)}
                />
                <span>Activa</span>
              </label>
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
                onClick={() => setOpenCreate(false)}
                disabled={creatingCampaign}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={onCreate}
                disabled={creatingCampaign}
              >
                {creatingCampaign ? "Guardando…" : "Crear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeConfirm} />
          <div className="relative z-[141] w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="px-5 py-4 border-b flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                <FiAlertTriangle className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Eliminar campaña</h3>
            </div>

            <div className="px-5 py-4 space-y-2">
              <p className="text-sm text-slate-700">
                ¿Estás seguro de eliminar la campaña{" "}
                <b>{confirmTarget?.name ?? `#${confirmTarget?.id}`}</b>?
              </p>
              <p className="text-sm text-slate-500">Esta acción es permanente.</p>
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
                onClick={closeConfirm}
                disabled={deletingCampaignId === confirmTarget?.id}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                onClick={onConfirmDelete}
                disabled={deletingCampaignId === confirmTarget?.id}
              >
                {deletingCampaignId === confirmTarget?.id
                  ? "Eliminando…"
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar */}
      {openEdit && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenEdit(false)} />
          <div className="relative z-[151] w-full max-w-xl mx-4 rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Editar campaña</h3>
              <button
                className="px-2 py-1 rounded-lg hover:bg-slate-100"
                onClick={() => setOpenEdit(false)}
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 gap-4">
              <Field
                label="Nombre"
                value={edit.name}
                onChange={(v) => setEditField("name", v)}
              />
              <Field
                label="Descripción"
                value={edit.description}
                onChange={(v) => setEditField("description", v)}
                textarea
              />
              <Field
                label="Slug (URL)"
                value={edit.url}
                onChange={(v) => setEditField("url", v)}
              />
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!edit.active}
                  onChange={(e) => setEditField("active", e.target.checked)}
                />
                <span>Activa</span>
              </label>
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
                onClick={() => setOpenEdit(false)}
                disabled={updatingCampaignId === edit.id}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={onSaveEdit}
                disabled={updatingCampaignId === edit.id}
              >
                {updatingCampaignId === edit.id ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CampaignCard({ c, onAskDelete, onAskEdit, deleting, updating }) {
  const frame = c.active ? "border-green-300" : "border-slate-200";
  return (
    <article
      className={`bg-white rounded-3xl border-2 ${frame} shadow-sm p-4 flex flex-col gap-3`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold truncate" title={c.name}>
            {c.name}
          </h3>
          <div className="mt-1 text-xs">
            <StatusBadge active={c.active} />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAskEdit}
            disabled={updating}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition
              ${
                updating
                  ? "border-slate-300 text-slate-400 opacity-60 cursor-not-allowed"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
              }`}
            title="Editar"
          >
            <FiEdit />
          </button>
          <button
            onClick={onAskDelete}
            disabled={deleting}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition
              ${
                deleting
                  ? "border-red-300 text-red-400 opacity-60 cursor-not-allowed"
                  : "border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
              }`}
            title="Eliminar"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-600">{c.description || "Sin descripción."}</p>

      <div className="flex items-center gap-2 text-sm text-slate-700">
        <FiLink className="text-slate-500" />
        <span className="truncate">{c.url}</span>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 text-[12px] text-slate-500">
        <div className="inline-flex items-center gap-2">
          <FiCalendar />
          <span>Creado: {formatDateTime(c.created_at)}</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <FiCalendar />
          <span>Actualizado: {formatDateTime(c.updated_at)}</span>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-2 px-2 py-1 text-[11px] rounded-full border border-green-200 bg-green-50 text-green-700">
      ● Activa
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 px-2 py-1 text-[11px] rounded-full border border-slate-200 bg-slate-50 text-slate-600">
      ○ Inactiva
    </span>
  );
}

function Field({ label, value, onChange, placeholder = "", textarea = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      {textarea ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          rows={4}
          placeholder={placeholder}
          className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
}

function formatDateTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } catch {
    return iso;
  }
}

export default Campaigns;
