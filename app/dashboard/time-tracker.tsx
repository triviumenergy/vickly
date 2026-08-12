"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

type Project = { id: string; name: string };
type Member = { id: string; full_name: string };
type TimeEntry = {
  id: string;
  entry_date: string;
  duration_minutes: number;
  note: string | null;
  project_id: string;
  member_id: string | null;
};

function minutesToLabel(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins} min`;
}

export default function TimeTracker({
  projects,
  members,
  assignments,
  initialEntries,
}: {
  projects: Project[];
  members: Member[];
  assignments: Record<string, string[]>;
  initialEntries: TimeEntry[];
}) {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [memberId, setMemberId] = useState<string>("");
  const [date, setDate] = useState(today);
  const [hours, setHours] = useState("1");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const assignedMembers = useMemo(() => {
    const assignedIds = assignments[projectId] ?? [];
    return members.filter((m) => assignedIds.includes(m.id));
  }, [projectId, assignments, members]);

  function flashSaved() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  function handleProjectChange(newProjectId: string) {
    setProjectId(newProjectId);
    setMemberId(""); // vuelve a "Yo" al cambiar de proyecto
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const hoursValue = parseFloat(hours.replace(",", "."));

    if (!projectId || !hoursValue || hoursValue <= 0) {
      setError("Elegí un proyecto y una cantidad de horas válida.");
      return;
    }

    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        project_id: projectId,
        member_id: memberId || null,
        entry_date: date,
        duration_minutes: Math.round(hoursValue * 60),
        note: note.trim() || null,
      })
      .select("id, entry_date, duration_minutes, note, project_id, member_id")
      .single();

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setEntries((prev) => [data as TimeEntry, ...prev]);
    setHours("1");
    setNote("");
    flashSaved();
  }

  async function handleDelete(entryId: string) {
    const { error } = await supabase
      .from("time_entries")
      .delete()
      .eq("id", entryId);

    if (error) {
      setError(error.message);
      return;
    }

    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  }

  function projectName(id: string) {
    return projects.find((p) => p.id === id)?.name ?? "—";
  }

  function memberName(id: string | null) {
    if (!id) return "Yo";
    return members.find((m) => m.id === id)?.full_name ?? "—";
  }

  const totalMinutesThisWeek = entries
    .filter((e) => {
      const entryDate = new Date(e.entry_date);
      const now = new Date();
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1);
      monday.setHours(0, 0, 0, 0);
      return entryDate >= monday;
    })
    .reduce((sum, e) => sum + e.duration_minutes, 0);

  if (projects.length === 0) {
    return (
      <div className="bg-cream border-l-4 border-teal rounded p-4 text-sm">
        Todavía no tenés proyectos activos. Creá uno en el módulo Proyectos
        para poder empezar a registrar tiempo.
      </div>
    );
  }

  return (
    <div>
      <div className="bg-panel border border-line rounded p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-ink-soft text-sm">Total esta semana</p>
          {savedFlash && (
            <span className="text-sm text-teal-dark font-medium">
              Cambios guardados
            </span>
          )}
        </div>
        <p className="font-display text-3xl font-extrabold">
          {minutesToLabel(totalMinutesThisWeek)}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-panel border border-line rounded p-6 mb-6"
      >
        <h2 className="font-display font-bold mb-4">Registrar tiempo</h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Proyecto
            </label>
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full border border-line rounded px-3 py-2 outline-none focus:border-teal"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {members.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Miembro
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full border border-line rounded px-3 py-2 outline-none focus:border-teal"
              >
                <option value="">Yo</option>
                {assignedMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                  </option>
                ))}
              </select>
              {assignedMembers.length === 0 && (
                <p className="text-xs text-ink-soft mt-1">
                  Nadie más está asignado a este proyecto todavía —
                  asignalo desde el módulo Proyectos.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-line rounded px-3 py-2 outline-none focus:border-teal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Horas</label>
            <input
              type="text"
              inputMode="decimal"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Ej: 1.5"
              className="w-full border border-line rounded px-3 py-2 outline-none focus:border-teal"
            />
          </div>
        </div>

        <label className="block text-sm font-medium mb-1">
          Nota (opcional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="¿En qué trabajaste?"
          className="w-full border border-line rounded px-3 py-2 mb-4 outline-none focus:border-teal"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-teal text-white font-medium rounded px-5 py-2 hover:bg-teal-dark transition-colors disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Registrar"}
        </button>
      </form>

      <h2 className="font-display font-bold mb-3">Últimos registros</h2>
      {entries.length === 0 ? (
        <p className="text-ink-soft text-sm">Todavía no cargaste tiempo.</p>
      ) : (
        <div className="bg-panel border border-line rounded divide-y divide-line">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="px-5 py-3 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">
                  {projectName(entry.project_id)}
                  {members.length > 0 && (
                    <span className="text-ink-soft font-normal">
                      {" · "}
                      {memberName(entry.member_id)}
                    </span>
                  )}
                </p>
                <p className="text-sm text-ink-soft truncate">
                  {entry.entry_date}
                  {entry.note ? ` · ${entry.note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-medium">
                  {minutesToLabel(entry.duration_minutes)}
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-ink-soft hover:text-red-600 text-sm"
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
