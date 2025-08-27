import { useMemo, useState } from "react";
import { FiEdit, FiX } from "react-icons/fi";

const safe = (v, fallback = "vacío") =>
  v === null || v === undefined || v === "" ? fallback : v;

const GROUPS = ["", "A", "B", "C", "Pruebas"]; // "" = sin asignar

/**
 * Props:
 * - routers: Array de routers
 * - onSaveRouter: (routerActualizado) => void  // Se llama solo al presionar Guardar
 */
export default function RouterTable({ routers, onSaveRouter }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null); // estado del router en edición

  const filtered = useMemo(() => {
    if (!query) return routers || [];
    const q = query.toLowerCase();
    return (routers || []).filter((r) =>
      [
        r?.mac,
        r?.device_name,
        r?.estacion,
        r?.municipio,
        String(r?.id),
        r?.group_name, // corregido el typo
      ]
        .map((x) => (x ?? "").toString().toLowerCase())
        .some((x) => x.includes(q))
    );
  }, [routers, query]);

  const handleOpenModal = (router) => {
    // Creamos un borrador independiente para no mutar hasta Guardar
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

  const handleClose = () => {
    setOpen(false);
    setDraft(null);
  };

  const handleSave = () => {
    if (onSaveRouter && draft) {
      onSaveRouter(draft); // Solo aquí propagamos cambios hacia el padre/API
    }
    handleClose();
  };

  const onKeyDownModal = (e) => {
    if (e.key === "Escape") handleClose();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold">Routers</h2>
        <input
          className="w-full md:w-72 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar por MAC, estación, municipio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
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
              <Th className="text-right pr-4">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t last:border-b">
                <Td>{safe(r.id)}</Td>
                <Td>{safe(r.mac)}</Td>
                <Td>{safe(r.device_name)}</Td>
                <Td>{safe(r.estacion)}</Td>
                <Td>{safe(r.municipio)}</Td>
                <Td>{safe(r.latitud)}</Td>
                <Td>{safe(r.longitud)}</Td>
                <Td>{safe(r.group_name, "—")}</Td>
                <Td className="text-right pr-4">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(r)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition"
                    aria-label={`Editar router ${r.id}`}
                  >
                    <FiEdit className="text-slate-600" />
                    <span className="hidden sm:inline">Editar</span>
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

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          onKeyDown={onKeyDownModal}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleClose}
          />
          {/* Content */}
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
                <Field
                  label="ID"
                  value={draft?.id}
                  onChange={(v) => setDraft((d) => ({ ...d, id: v }))}
                  disabled // normalmente el ID no se edita
                />
                <Field
                  label="MAC"
                  value={draft?.mac}
                  onChange={(v) => setDraft((d) => ({ ...d, mac: v }))}
                />
                <Field
                  label="Device"
                  value={draft?.device_name}
                  onChange={(v) =>
                    setDraft((d) => ({ ...d, device_name: v }))
                  }
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
                  <label className="text-xs font-medium text-slate-600">
                    Group
                  </label>
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
                onClick={handleSave}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`text-left px-4 py-2 font-semibold ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-2 align-top ${className}`}>{children}</td>;
}

function Field({ label, value, onChange, type = "text", disabled = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? "bg-slate-50 text-slate-400" : "bg-white"
        }`}
      />
    </div>
  );
}
