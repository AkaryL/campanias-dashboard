import { useMemo, useState } from "react";

const safe = (v, fallback = "vacío") =>
  v === null || v === undefined || v === "" ? fallback : v;

const GROUPS = ["", "A", "B", "C"]; // "" = sin asignar

export default function RouterTable({ routers, onChangeGroup }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return routers;
    const q = query.toLowerCase();
    return routers.filter((r) =>
      [
        r.mac,
        r.device_name,
        r.estacion,
        r.municipio,
        String(r.id),
        r.gropu_name,
      ]
        .map((x) => (x ?? "").toString().toLowerCase())
        .some((x) => x.includes(q))
    );
  }, [routers, query]);

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
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t last:border-b">
                <Td>{safe(r.id, "vacío")}</Td>
                <Td>{safe(r.mac, "vacío")}</Td>
                <Td>{safe(r.device_name, "vacío")}</Td>
                <Td>{safe(r.estacion, "vacío")}</Td>
                <Td>{safe(r.municipio, "vacío")}</Td>
                <Td>{safe(r.latitud, "vacío")}</Td>
                <Td>{safe(r.longitud, "vacío")}</Td>
                <Td>
                <select
                  value={r.group_name ?? ""}
                  onChange={(e) => onChangeGroup(r.id, e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded-lg bg-white"
                >
                  {["", "A", "B", "C", "Pruebas"].map((g) => (
                    <option key={g} value={g}>
                      {g === "" ? "—" : g}
                    </option>
                  ))}
                </select>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400">
                  No hay resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="text-left px-4 py-2 font-semibold">{children}</th>;
}

function Td({ children }) {
  return <td className="px-4 py-2 align-top">{children}</td>;
}
