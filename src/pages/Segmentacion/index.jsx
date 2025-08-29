// src/pages/Segmentacion/index.jsx
import { useEffect, useMemo, useState } from "react";
import { useCampaigns } from "../../context/CampaignsContext";
import {
  FiEdit,
  FiTrash2,
  FiAlertTriangle,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import { FaMale, FaFemale } from "react-icons/fa";

export default function Segmentacion() {
  const {
    // Routers para stats
    routers,
    fetchRouters,

    // SEGMENTS
    segments,
    loadingSegments,
    fetchSegments,
    createSegment,
    creatingSegment,
    updateSegment,
    updatingSegment,
    deleteSegment,
    deletingSegmentId,

    // CAMPAIGNS
    campaigns,
    loadingCampaigns,
    fetchCampaigns,
  } = useCampaigns();

  // cargar routers + segmentos + campañas al montar
  useEffect(() => {
    fetchRouters?.();
    fetchSegments?.();
    fetchCampaigns?.();
  }, [fetchRouters, fetchSegments, fetchCampaigns]);

  // Mapa id -> nombre de campaña
  const campaignNameById = useMemo(() => {
    const map = new Map();
    for (const c of campaigns || []) map.set(c.id, c.name);
    return map;
  }, [campaigns]);

  // stats por group_name de routers
  const stats = useMemo(() => {
    const acc = {};
    for (const r of routers) {
      const key = r.group_name || "—";
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, [routers]);

  // =========================
  //       ORDENAMIENTO
  // =========================
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("asc");

  const sortOptions = [
    { value: "id", label: "ID" },
    { value: "name", label: "Nombre" },
    { value: "campaign_name", label: "Campaña" },
    { value: "group_name", label: "Grupo" },
    { value: "gender", label: "Género" },
    { value: "age", label: "Edad" },
    { value: "updated_at", label: "Actualizado" },
    { value: "created_at", label: "Creado" },
  ];

  const toggleDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  const sortedSegments = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;

    const getNum = (n) => {
      const v = Number(n);
      if (Number.isFinite(v)) return v;
      return sortDir === "asc" ? Infinity : -Infinity;
    };
    const getStr = (s) => (s ?? "").toString();
    const getDateMs = (iso) => {
      const t = new Date(iso).getTime();
      return Number.isFinite(t) ? t : sortDir === "asc" ? Infinity : -Infinity;
    };

    const arr = [...(segments || [])];
    arr.sort((a, b) => {
      let res = 0;
      switch (sortKey) {
        case "id":
          res = getNum(a.id) - getNum(b.id);
          break;
        case "name":
          res = getStr(a.name).localeCompare(getStr(b.name), "es", {
            sensitivity: "base",
          });
          break;
        case "campaign_name": {
          const aName = getStr(campaignNameById.get(a.campaign_id));
          const bName = getStr(campaignNameById.get(b.campaign_id));
          res = aName.localeCompare(bName, "es", { sensitivity: "base" });
          break;
        }
        case "group_name":
          res = getStr(a.group_name).localeCompare(getStr(b.group_name), "es", {
            sensitivity: "base",
          });
          break;
        case "gender":
          // Orden (alfabético) entre "any", "f", "m" u otros
          res = getStr(a.gender).localeCompare(getStr(b.gender), "es", {
            sensitivity: "base",
          });
          break;
        case "age": {
          const aMin = getNum(a.min_age),
            bMin = getNum(b.min_age);
          if (aMin !== bMin) {
            res = aMin - bMin;
            break;
          }
          const aMax = getNum(a.max_age),
            bMax = getNum(b.max_age);
          res = aMax - bMax;
          break;
        }
        case "updated_at":
          res = getDateMs(a.updated_at) - getDateMs(b.updated_at);
          break;
        case "created_at":
          res = getDateMs(a.created_at) - getDateMs(b.created_at);
          break;
        default:
          res = 0;
      }
      return res * dir;
    });
    return arr;
  }, [segments, sortKey, sortDir, campaignNameById]);

  // =========================
  //          CREAR
  // =========================
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    campaign_id: "",
    group_name: "",
    gender: "",
    min_age: "",
    max_age: "",
  });
  const [errors, setErrors] = useState({});
  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const validate = (values = form) => {
    const e = {};
    if (!values.name?.trim()) e.name = "Requerido";
    if (!values.campaign_id) e.campaign_id = "Requerido";
    if (!values.group_name?.trim()) e.group_name = "Requerido";
    if (!values.gender?.trim()) e.gender = "Requerido";
    if (values.min_age === "" || isNaN(Number(values.min_age))) e.min_age = "Número";
    if (values.max_age === "" || isNaN(Number(values.max_age))) e.max_age = "Número";
    if (!e.min_age && !e.max_age && Number(values.min_age) > Number(values.max_age)) {
      e.max_age = "Debe ser ≥ mínima";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({
      name: "",
      campaign_id: "",
      group_name: "",
      gender: "",
      min_age: "",
      max_age: "",
    });
    setErrors({});
  };

  const onCreate = async () => {
    if (!validate()) return;
    // Si eligió "Ambos", mandamos "any"
    const gender = form.gender.trim() === "any" ? "any" : form.gender.trim();
    const payload = {
      name: form.name.trim(),
      campaign_id: Number(form.campaign_id),
      group_name: form.group_name.trim(),
      gender, // "m" | "f" | "any"
      min_age: Number(form.min_age),
      max_age: Number(form.max_age),
    };
    try {
      await createSegment(payload);
      resetForm();
      setOpenCreate(false);
    } catch {
      alert("No se pudo crear el segmento");
    }
  };

  // =========================
  //          EDITAR
  // =========================
  const [openEdit, setOpenEdit] = useState(false);
  const [edit, setEdit] = useState({
    id: null,
    name: "",
    campaign_id: "",
    group_name: "",
    gender: "",
    min_age: "",
    max_age: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const setEditField = (k, v) => setEdit((prev) => ({ ...prev, [k]: v }));

  const validateEdit = (values = edit) => {
    const e = {};
    if (!values.name?.trim()) e.name = "Requerido";
    if (!values.campaign_id) e.campaign_id = "Requerido";
    if (!values.group_name?.trim()) e.group_name = "Requerido";
    if (!values.gender?.trim()) e.gender = "Requerido";
    if (values.min_age === "" || isNaN(Number(values.min_age))) e.min_age = "Número";
    if (values.max_age === "" || isNaN(Number(values.max_age))) e.max_age = "Número";
    if (!e.min_age && !e.max_age && Number(values.min_age) > Number(values.max_age)) {
      e.max_age = "Debe ser ≥ mínima";
    }
    setEditErrors(e);
    return Object.keys(e).length === 0;
  };

  const openEditModal = (s) => {
    setEdit({
      id: s.id,
      name: s.name ?? "",
      campaign_id: String(s.campaign_id ?? ""),
      group_name: s.group_name ?? "",
      gender: (s.gender ?? ""), // puede venir "m" | "f" | "any"
      min_age: String(s.min_age ?? ""),
      max_age: String(s.max_age ?? ""),
    });
    setEditErrors({});
    setOpenEdit(true);
  };

  const onSaveEdit = async () => {
    if (!validateEdit()) return;
    const { id, ...rest } = edit;
    const gender = rest.gender.trim() === "any" ? "any" : rest.gender.trim();
    const payload = {
      name: rest.name.trim(),
      campaign_id: Number(rest.campaign_id),
      group_name: rest.group_name.trim(),
      gender, // "m" | "f" | "any"
      min_age: Number(rest.min_age),
      max_age: Number(rest.max_age),
    };
    try {
      await updateSegment(id, payload);
      setOpenEdit(false);
    } catch {
      alert("No se pudo actualizar el segmento");
    }
  };

  // =========================
  //   ELIMINAR (modal simple)
  // =========================
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const openConfirmDelete = (segment) => {
    setConfirmTarget(segment);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };
  const onConfirmDelete = async () => {
    if (!confirmTarget) return;
    try {
      await deleteSegment(confirmTarget.id);
      closeConfirm();
    } catch {
      alert("No se pudo eliminar el segmento");
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Segmentación</h1>
          <p className="text-slate-500">Segmentos existentes desde el backend.</p>
        </div>

        <button
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          + Crear nuevo segmento
        </button>
      </header>

      {/* Stats de routers por grupo (opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([group, count]) => (
          <div
            key={group}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
          >
            <div className="text-sm text-slate-500">Group {group}</div>
            <div className="text-3xl font-bold">{count}</div>
            <div className="text-xs text-slate-400 mt-1">routers asignados</div>
          </div>
        ))}
      </div>

      {/* Controles de ordenamiento */}
      <div className="flex items-center gap-3">
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

      {/* GRID de cards */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
        {loadingSegments ? (
          <div className="text-slate-400">Cargando segmentos…</div>
        ) : sortedSegments.length === 0 ? (
          <div className="text-slate-400">No hay segmentos.</div>
        ) : (
          sortedSegments.map((s) => {
            const g = (s.gender || "").toLowerCase();
            const isMale = g === "m";
            const isFemale = g === "f";
            const isBoth = g === "any" || g === "mf" || g === "both" || g === "ambos";

            // Tema por género: azul (m), rosa (f), morado (any/ambos)
            const frame = isBoth
              ? "border-purple-300"
              : isMale
              ? "border-blue-300"
              : isFemale
              ? "border-pink-300"
              : "border-slate-200";

            const accentText = isBoth
              ? "text-purple-700"
              : isMale
              ? "text-blue-700"
              : isFemale
              ? "text-pink-700"
              : "text-slate-700";

            const pastelBg = isBoth
              ? "bg-purple-50"
              : isMale
              ? "bg-blue-50"
              : isFemale
              ? "bg-pink-50"
              : "bg-slate-50";

            const genderLabel =
              isBoth
                ? "AMBOS"
                : isMale
                ? "HOMBRE"
                : isFemale
                ? "MUJER"
                : (s.gender ?? "—").toString().toUpperCase();

            const genderIcon = isBoth ? (
              <div className="flex items-center gap-1">
                <FaMale className="w-5 h-5 text-purple-600" />
                <FaFemale className="w-5 h-5 text-purple-600" />
              </div>
            ) : isMale ? (
              <FaMale className="w-5 h-5 text-blue-600" />
            ) : isFemale ? (
              <FaFemale className="w-5 h-5 text-pink-600" />
            ) : (
              <FaMale className="w-5 h-5 text-slate-500 opacity-60" />
            );

            return (
              <article
                key={s.id}
                className={`h-full bg-white rounded-3xl border-2 ${frame} shadow-sm p-4 flex flex-col gap-4`}
              >
                {/* fila superior: título + fechas + acciones */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold truncate" title={s.name || "—"}>
                      {s.name || "—"}
                    </h3>
                    <div className="text-sm text-slate-600 truncate">
                      Campaña: {campaignNameById.get(s.campaign_id) ?? "—"}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-[11px] text-slate-500 text-right leading-tight">
                      <div>Creado: {formatDateShort(s.created_at)}</div>
                      <div>Act.: {formatDateShort(s.updated_at)}</div>
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(s)}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
                        aria-label={`Editar segmento ${s.id}`}
                        title="Editar"
                      >
                        <FiEdit className="text-slate-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() => openConfirmDelete(s)}
                        disabled={deletingSegmentId === s.id}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg transition ${
                          deletingSegmentId === s.id ? " opacity-60 cursor-not-allowed" : " hover:bg-red-50 "
                        }`}
                        aria-label={`Eliminar segmento ${s.id}`}
                        title="Eliminar"
                      >
                        <FiTrash2 className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* bloque inferior info */}
                <div className={`mt-auto grid grid-cols-3 ${pastelBg} rounded-2xl p-3`}>
                  <div className="px-2 text-center">
                    <div className="text-xs text-slate-500">Edad</div>
                    <div className={`font-medium ${accentText}`}>
                      {(s.min_age ?? "—")}–{s.max_age ?? "—"}
                    </div>
                  </div>
                  <div className="px-2 text-center border-l">
                    <div className="text-xs text-slate-500">Género</div>
                    <div className="flex items-center justify-center gap-2">
                      {genderIcon}
                    </div>
                  </div>
                  <div className="px-2 text-center border-l">
                    <div className="text-xs text-slate-500">Grupo</div>
                    <div className={`font-medium ${accentText}`}>{s.group_name ?? "—"}</div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* MODAL CREAR */}
      {openCreate && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenCreate(false)} />
          <div className="relative z-[121] w-full max-w-xl mx-4 rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Crear segmento</h3>
              <button className="px-2 py-1 rounded-lg hover:bg-slate-100" onClick={() => setOpenCreate(false)}>
                ✕
              </button>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nombre" value={form.name} onChange={(v) => setField("name", v)} error={errors.name} />

              <Select
                label={`Campaña ${loadingCampaigns ? "(cargando…)" : ""}`}
                value={String(form.campaign_id ?? "")}
                onChange={(v) => setField("campaign_id", v)}
                options={[
                  { value: "", label: "Selecciona campaña" },
                  ...(campaigns || []).map((c) => ({ value: String(c.id), label: c.name })),
                ]}
                disabled={loadingCampaigns}
                error={errors.campaign_id}
              />

              <Select
                label="Grupo"
                value={form.group_name}
                onChange={(v) => setField("group_name", v)}
                options={[
                  { value: "", label: "Selecciona grupo" },
                  { value: "A", label: "A" },
                  { value: "B", label: "B" },
                  { value: "C", label: "C" },
                  { value: "Pruebas", label: "Pruebas" },
                ]}
                error={errors.group_name}
              />

              {/* 👇 Amb0s ahora vale "any" para la API */}
              <Select
                label="Género"
                value={form.gender}
                onChange={(v) => setField("gender", v)}
                options={[
                  { value: "", label: "Selecciona género" },
                  { value: "m", label: "Masculino (m)" },
                  { value: "f", label: "Femenino (f)" },
                  { value: "any", label: "Ambos" },
                ]}
                error={errors.gender}
              />

              <Field label="Edad mínima" type="number" value={form.min_age} onChange={(v) => setField("min_age", v)} error={errors.min_age} />
              <Field label="Edad máxima" type="number" value={form.max_age} onChange={(v) => setField("max_age", v)} error={errors.max_age} />
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50" onClick={() => setOpenCreate(false)} disabled={creatingSegment}>
                Cancelar
              </button>
              <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60" onClick={onCreate} disabled={creatingSegment}>
                {creatingSegment ? "Guardando…" : "Crear segmento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {openEdit && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenEdit(false)} />
          <div className="relative z-[121] w-full max-w-xl mx-4 rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Editar segmento</h3>
              <button className="px-2 py-1 rounded-lg hover:bg-slate-100" onClick={() => setOpenEdit(false)}>
                ✕
              </button>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nombre" value={edit.name} onChange={(v) => setEditField("name", v)} error={editErrors.name} />

              <Select
                label={`Campaña ${loadingCampaigns ? "(cargando…)" : ""}`}
                value={String(edit.campaign_id ?? "")}
                onChange={(v) => setEditField("campaign_id", v)}
                options={[
                  { value: "", label: "Selecciona campaña" },
                  ...(campaigns || []).map((c) => ({ value: String(c.id), label: c.name })),
                ]}
                disabled={loadingCampaigns}
                error={editErrors.campaign_id}
              />

              <Select
                label="Grupo"
                value={edit.group_name}
                onChange={(v) => setEditField("group_name", v)}
                options={[
                  { value: "", label: "Selecciona grupo" },
                  { value: "A", label: "A" },
                  { value: "B", label: "B" },
                  { value: "C", label: "C" },
                  { value: "Pruebas", label: "Pruebas" },
                ]}
                error={editErrors.group_name}
              />

              {/* 👇 "Ambos" usa "any" */}
              <Select
                label="Género"
                value={edit.gender}
                onChange={(v) => setEditField("gender", v)}
                options={[
                  { value: "", label: "Selecciona género" },
                  { value: "m", label: "Masculino (m)" },
                  { value: "f", label: "Femenino (f)" },
                  { value: "any", label: "Ambos" },
                ]}
                error={editErrors.gender}
              />

              <Field label="Edad mínima" type="number" value={edit.min_age} onChange={(v) => setEditField("min_age", v)} error={editErrors.min_age} />
              <Field label="Edad máxima" type="number" value={edit.max_age} onChange={(v) => setEditField("max_age", v)} error={editErrors.max_age} />
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50" onClick={() => setOpenEdit(false)} disabled={updatingSegment}>
                Cancelar
              </button>
              <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60" onClick={onSaveEdit} disabled={updatingSegment}>
                {updatingSegment ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeConfirm} />
          <div className="relative z-[141] w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="px-5 py-4 border-b flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                <FiAlertTriangle className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Eliminar segmento</h3>
            </div>

            <div className="px-5 py-4 space-y-2">
              <p className="text-sm text-slate-700">
                ¿Estás seguro de eliminar el segmento <b>{confirmTarget?.name ?? `#${confirmTarget?.id}`}</b>?
              </p>
              <p className="text-sm text-slate-500">Esta acción es permanente.</p>
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50" onClick={closeConfirm} disabled={deletingSegmentId === confirmTarget?.id}>
                Cancelar
              </button>
              <button className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60" onClick={onConfirmDelete} disabled={deletingSegmentId === confirmTarget?.id}>
                {deletingSegmentId === confirmTarget?.id ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ====== helpers y campos ====== */

function formatDateShort(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return iso;
  }
}

function Field({ label, value, onChange, type = "text", error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={`px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
          error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-blue-500"
        } bg-white`}
      />
      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  );
}

function Select({ label, value, onChange, options = [], error, disabled = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
          error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-blue-500"
        } ${disabled ? "bg-slate-50 text-slate-400" : "bg-white"}`}
      >
        {options.map((o) => (
          <option key={`${o.value}-${o.label}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  );
}
