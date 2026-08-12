"use client";

import { useState } from "react";

type Row = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  workspaceName: string;
  accountType: "Individual" | "Equipo";
  memberCount: number;
};

function formatDate(iso: string | null) {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleDateString("es-AR");
}

function isActiveLastMonth(iso: string | null) {
  if (!iso) return false;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return new Date(iso).getTime() >= thirtyDaysAgo;
}

export default function AdminTable({ rows }: { rows: Row[] }) {
  const [onlyActive, setOnlyActive] = useState(false);

  const filteredRows = onlyActive
    ? rows.filter((r) => isActiveLastMonth(r.lastSignInAt))
    : rows;

  const teamCount = rows.filter((r) => r.accountType === "Equipo").length;
  const individualCount = rows.length - teamCount;

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-panel border border-line rounded p-4">
          <p className="text-ink-soft text-sm mb-1">Total registrados</p>
          <p className="font-display text-2xl font-extrabold">
            {rows.length}
          </p>
        </div>
        <div className="bg-panel border border-line rounded p-4">
          <p className="text-ink-soft text-sm mb-1">Individual</p>
          <p className="font-display text-2xl font-extrabold">
            {individualCount}
          </p>
        </div>
        <div className="bg-panel border border-line rounded p-4">
          <p className="text-ink-soft text-sm mb-1">Equipo</p>
          <p className="font-display text-2xl font-extrabold">{teamCount}</p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={onlyActive}
          onChange={(e) => setOnlyActive(e.target.checked)}
          className="accent-teal"
        />
        Mostrar solo activos en el último mes
      </label>

      <div className="bg-panel border border-line rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-soft">
              <th className="px-4 py-3 font-medium">Correo</th>
              <th className="px-4 py-3 font-medium">Workspace</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Miembros</th>
              <th className="px-4 py-3 font-medium">Registrado</th>
              <th className="px-4 py-3 font-medium">Último acceso</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">{row.workspaceName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      row.accountType === "Equipo"
                        ? "bg-mint text-teal-dark"
                        : "bg-cream text-teal-dark"
                    }`}
                  >
                    {row.accountType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.accountType === "Equipo" ? row.memberCount : "—"}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {formatDate(row.createdAt)}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {formatDate(row.lastSignInAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
