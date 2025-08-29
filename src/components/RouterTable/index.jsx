// src/components/RouterTable.jsx
import { useMemo, useState } from "react";
import { FiEdit, FiX, FiTrash2, FiAlertTriangle, FiPlus } from "react-icons/fi";
import { useCampaigns } from "../../context/CampaignsContext";

const safe = (v, fallback = "vacío") =>
  v === null || v === undefined || v === "" ? fallback : v;

const GROUPS = ["", "A", "B", "C", "Pruebas"]; // "" = sin asignar

export default function RouterTable({ routers, onSaveRouter }) {
  const { createRouter, creatingRouter, deleteRouter, deletingRouterId } = useCampaigns();

  const [searchBy, setSearchBy] = useState("all");
  const [query, setQuery] = useState("");

  // EDIT
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);

  // CREATE
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    serial: "",
    mac: "",
    device_name: "",
    estacion: "",
    municipio: "",
    latitud: "",
    longitud: "",
    group_name: "",
  });
  const [errors, setErrors] = useState({});

  // DELETE confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const norm = (v) => (v ?? "").toString().toLowerCase();

  const filtered = useMemo(() => {
    const list = routers || [];
    const q = norm(query);
    if (!q) return list;

    return list.filter((r) => {
      if (searchBy === "all") {
        return [
          r?.id,
          r?.mac,
          r?.device_name,
          r?.estacion,
          r?.municipio,
          r?.latitud,
          r?.longitud,
          r?.group_name,
        ]
          .map(norm)
          .some((x) => x.includes(q));
      } else {
        return norm(r?.[searchBy]).includes(q);
      }
    });
  }, [routers, query, searchBy]);

  const handleOpenModal = (router) => {
    setDraft({
      id: router.id ?? "",
      mac: router.mac ?? "",
      device_name: router.device_name ?? "",
      estacion: router.estacion ?? "",
      municipio: router.municipio ?? "",
      latitud: router.latitud ?? "",
      longitud: router.longitud ?? "",
      group_name: router.group_name ?? "",
    });
    setOpen(true);
  };

  const SEARCH_FIELDS = [
    { key: "all", label: "Todos" },
    { key: "id", label: "ID" },
    { key: "mac", label: "MAC" },
    { key: "device_name", label: "Device" },
    { key: "estacion", label: "Estación" },
    { key: "municipio", label: "Municipio" },
    { key: "latitud", label: "Latitud" },
    { key: "longitud", label: "Longitud" },
    { key: "group_name", label: "Grupo" },
  ];

  const handleClose = () => {
    setOpen(false);
    setDraft(null);
  };

  const handleSave = () => {
    if (onSaveRouter && draft) onSaveRouter(draft);
    handleClose();
  };

  const onKeyDownModal = (e) => {
    if (e.key === "Escape") handleClose();
  };

  // ==== Crear ====
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.serial?.trim()) e.serial = "Requerido";
    if (!form.mac?.trim()) e.mac = "Requerido";
    if (!form.device_name?.trim()) e.device_name = "Requerido";
    if (!form.estacion?.trim()) e.estacion = "Requerido";
    if (!form.municipio?.trim()) e.municipio = "Requerido";
    if (form.latitud === "" || isNaN(Number(form.latitud))) e.latitud = "Número";
    if (form.longitud === "" || isNaN(Number(form.longitud))) e.longitud = "Número";
    if (!form.group_name?.trim()) e.group_name = "Requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm({
      serial: "",
      mac: "",
      device_name: "",
      estacion: "",
      municipio: "",
      latitud: "",
      longitud: "",
      group_name: "",
    });
    setErrors({});
  };

  const onCreate = async () => {
    if (!validate()) return;
    const payload = {
      serial: form.serial.trim(),
      mac: form.mac.trim(),
      device_name: form.device_name.trim(),
      estacion: form.estacion.trim(),
      municipio: form.municipio.trim(),
      latitud: Number(form.latitud),
      longitud: Number(form.longitud),
      group_name: form.group_name.trim(),
    };
    try {
      await createRouter(payload);
      resetForm();
      setOpenCreate(false);
    } catch (e) {
      alert("No se pudo crear el router");
      console.error(e);
    }
  };

  // ==== Eliminar ====
  const askDelete = (router) => {
    setConfirmTarget(router);
    setConfirmOpen(true);
  };
  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmTarget(null);
  };
  const onConfirmDelete = async () => {
    if (!confirmTarget?.id) return;
    try {
      await deleteRouter(confirmTarget.id);
      closeConfirm();
    } catch {
      alert("No se pudo eliminar el router");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Header de tabla */}
      <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold">Routers</h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <select
              className="px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
            >
              {SEARCH_FIELDS.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>

            <input
              className="w-full md:w-72 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={
                searchBy === "all"
                  ? "Buscar en todas las columnas…"
                  : `Buscar por ${SEARCH_FIELDS.find((f) => f.key === searchBy)?.label}…`
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            title="Crear nuevo router"
          >
            <FiPlus /> Nuevo router
          </button>
        </div>
      </div>

      {/* Tabla compacta que no se desborda */}
      <div className="w-full overflow-x-hidden">
        <table className="table-auto w-full text-xs leading-tight">
          <colgroup>
            <col className="w-12" />
            <col className="w-[12ch]" />
            <col className="w-[18ch]" />
            <col className="w-[16ch]" />
            <col className="w-[14ch]" />
            <col className="w-[10ch]" />
            <col className="w-[10ch]" />
            <col className="w-[10ch]" />
            <col className="w-[12ch]" />
          </colgroup>

          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <Th>ID</Th>
              <Th>MAC</Th>
              <Th>Device</Th>
              <Th>Estación</Th>
              <Th>Municipio</Th>
              <Th>Latitud</Th>
              <Th>Longitud</Th>
              <Th>Group</Th>
              <Th className="text-right pr-2">Acciones</Th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t last:border-b">
                <Td className="whitespace-nowrap">{safe(r.id)}</Td>
                <Td className="whitespace-nowrap font-mono text-[11px]">
                  {safe(r.mac)}
                </Td>
                <Td className="whitespace-normal break-words max-w-[18ch]">
                  {safe(r.device_name)}
                </Td>
                <Td className="whitespace-normal break-words max-w-[16ch]">
                  {safe(r.estacion)}
                </Td>
                <Td className="whitespace-normal break-words max-w-[14ch]">
                  {safe(r.municipio)}
                </Td>
                <Td className="whitespace-nowrap">{safe(r.latitud)}</Td>
                <Td className="whitespace-nowrap">{safe(r.longitud)}</Td>
                <Td className="whitespace-nowrap">{safe(r.group_name, "—")}</Td>
                <Td className="text-right pr-2">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(r)}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition"
                    aria-label={`Editar router ${r.id}`}
                    title="Editar"
                  >
                    <FiEdit className="text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => askDelete(r)}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 transition ml-1"
                    aria-label={`Eliminar router ${r.id}`}
                    title="Eliminar"
                    disabled={deletingRouterId === r.id}
                  >
                    <FiTrash2 />
                  </button>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="p-6 text-center text-slate-400">
                  No hay resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal EDITAR */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onKeyDown={onKeyDownModal}
        >
          <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
          <div className="relative z-[101] w-full max-w-2xl mx-4 rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-lg font-semibold">Editar router</h3>
              <button
                className="p-2 rounded-lg hover:bg-slate-100"
                onClick={handleClose}
                aria-label="Cerrar"
              >
                <FiX className="text-slate-600" />
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="ID" value={draft?.id} onChange={() => {}} disabled />
                <Field
                  label="MAC"
                  value={draft?.mac}
                  onChange={(v) => setDraft((d) => ({ ...d, mac: v }))}
                />
                <Field
                  label="Device"
                  value={draft?.device_name}
                  onChange={(v) => setDraft((d) => ({ ...d, device_name: v }))}
                />
                <Field
                  label="Estación"
                  value={draft?.estacion}
                  onChange={(v) => setDraft((d) => ({ ...d, estacion: v }))}
                />
                <Field
                  label="Municipio"
                  value={draft?.municipio}
                  onChange={(v) => setDraft((d) => ({ ...d, municipio: v }))}
                />
                <Field
                  label="Latitud"
                  value={draft?.latitud}
                  onChange={(v) => setDraft((d) => ({ ...d, latitud: v }))}
                />
                <Field
                  label="Longitud"
                  value={draft?.longitud}
                  onChange={(v) => setDraft((d) => ({ ...d, longitud: v }))}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600">Group</label>
                  <select
                    className="px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={draft?.group_name ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, group_name: e.target.value }))
                    }
                  >
                    {GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {g === "" ? "—" : g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
                onClick={handleClose}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  if (onSaveRouter && draft) onSaveRouter(draft);
                  handleClose();
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CREAR */}
      {openCreate && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenCreate(false)} />
          <div className="relative z-[106] w-full max-w-2xl mx-4 rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Nuevo router</h3>
              <button
                className="px-2 py-1 rounded-lg hover:bg-slate-100"
                onClick={() => setOpenCreate(false)}
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Serial" value={form.serial} onChange={(v) => setField("serial", v)} error={errors.serial} />
              <Field label="MAC" value={form.mac} onChange={(v) => setField("mac", v)} error={errors.mac} />
              <Field label="Device" value={form.device_name} onChange={(v) => setField("device_name", v)} error={errors.device_name} />
              <Field label="Estación" value={form.estacion} onChange={(v) => setField("estacion", v)} error={errors.estacion} />
              <Field label="Municipio" value={form.municipio} onChange={(v) => setField("municipio", v)} error={errors.municipio} />
              <Field label="Latitud" type="number" value={form.latitud} onChange={(v) => setField("latitud", v)} error={errors.latitud} />
              <Field label="Longitud" type="number" value={form.longitud} onChange={(v) => setField("longitud", v)} error={errors.longitud} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">Grupo</label>
                <select
                  value={form.group_name}
                  onChange={(e) => setField("group_name", e.target.value)}
                  className={`px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${errors.group_name ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-blue-500"} bg-white`}
                >
                  <option value="">Selecciona grupo</option>
                  {GROUPS.filter(Boolean).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {errors.group_name && <span className="text-[11px] text-red-500">{errors.group_name}</span>}
              </div>
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
                onClick={() => setOpenCreate(false)}
                disabled={creatingRouter}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                onClick={onCreate}
                disabled={creatingRouter}
              >
                {creatingRouter ? "Guardando…" : "Crear router"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal CONFIRMAR ELIMINACIÓN */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeConfirm} />
          <div className="relative z-[111] w-full max-w-lg mx-4 rounded-2xl bg-white shadow-xl border border-slate-200">
            <div className="px-5 py-4 border-b flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                <FiAlertTriangle className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Eliminar router</h3>
            </div>

            <div className="px-5 py-4 space-y-2">
              <p className="text-sm text-slate-700">
                ¿Estás seguro de eliminar el router <b>#{confirmTarget?.id}</b>?
              </p>
              <p className="text-sm text-slate-500">Esta acción es permanente.</p>
            </div>

            <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
              <button
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50"
                onClick={closeConfirm}
                disabled={deletingRouterId === confirmTarget?.id}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                onClick={onConfirmDelete}
                disabled={deletingRouterId === confirmTarget?.id}
              >
                {deletingRouterId === confirmTarget?.id ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }) {
  return <th className={`text-left px-2 py-2 font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-2 py-2 align-top ${className}`}>{children}</td>;
}

function Field({ label, value, onChange, type = "text", disabled = false, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
          error ? "border-red-400 focus:ring-red-200" : "border-slate-300 focus:ring-blue-500"
        } ${disabled ? "bg-slate-50 text-slate-400" : "bg-white"}`}
      />
      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  );
}
