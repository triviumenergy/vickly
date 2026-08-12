"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type WorkspaceData = {
  id: string;
  phone: string | null;
  company_name: string | null;
  legal_name: string | null;
};

export default function MisDatosForm({
  email,
  workspace,
}: {
  email: string;
  workspace: WorkspaceData;
}) {
  const supabase = createClient();

  const [phone, setPhone] = useState(workspace.phone ?? "");
  const [companyName, setCompanyName] = useState(
    workspace.company_name ?? ""
  );
  const [legalName, setLegalName] = useState(workspace.legal_name ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Aviso nativo del navegador si intenta cerrar/recargar con
  // cambios sin guardar (punto 10 del prompt original).
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  function markDirty<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
    };
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("workspaces")
      .update({
        phone: phone.trim() || null,
        company_name: companyName.trim() || null,
        legal_name: legalName.trim() || null,
      })
      .eq("id", workspace.id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDirty(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 3000);
  }

  return (
    <div className="bg-panel border border-line rounded p-6 max-w-md">
      <label className="block text-sm font-medium mb-1">
        Correo electrónico
      </label>
      <input
        type="email"
        disabled
        value={email}
        className="w-full border border-line rounded px-3 py-2 mb-4 bg-cream/50 text-ink-soft"
      />

      <label className="block text-sm font-medium mb-1">Teléfono</label>
      <input
        type="tel"
        value={phone}
        onChange={(e) => markDirty(setPhone)(e.target.value)}
        placeholder="Ej: +54 9 11 1234-5678"
        className="w-full border border-line rounded px-3 py-2 mb-4 outline-none focus:border-teal"
      />

      <label className="block text-sm font-medium mb-1">
        Nombre de la empresa
      </label>
      <input
        type="text"
        value={companyName}
        onChange={(e) => markDirty(setCompanyName)(e.target.value)}
        placeholder="Sin cargar"
        className="w-full border border-line rounded px-3 py-2 mb-4 outline-none focus:border-teal"
      />

      <label className="block text-sm font-medium mb-1">Razón social</label>
      <input
        type="text"
        value={legalName}
        onChange={(e) => markDirty(setLegalName)(e.target.value)}
        placeholder="Sin cargar"
        className="w-full border border-line rounded px-3 py-2 mb-5 outline-none focus:border-teal"
      />

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="flex items-center gap-4">
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-teal text-white font-medium rounded px-5 py-2 hover:bg-teal-dark transition-colors disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        )}
        {savedFlash && (
          <span className="text-sm text-teal-dark font-medium">
            Cambios guardados
          </span>
        )}
      </div>
    </div>
  );
}
