"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  name: string;
  is_active: boolean;
};

type Member = {
  id: string;
  full_name: string;
};

export default function ProjectsManager({
  workspaceId,
  initialProjects,
  members,
  initialAssignments,
}: {
  workspaceId: string;
  initialProjects: Project[];
  members: Member[];
  initialAssignments: Record<string, string[]>;
}) {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [assignments, setAssignments] =
    useState<Record<string, string[]>>(initialAssignments);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function flashSaved() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setError(null);

    const { data, error } = await supabase
      .from("projects")
      .insert({ workspace_id: workspaceId, name: newName.trim() })
      .select("id, name, is_active")
      .single();

    setCreating(false);

    if (error) {
      setError(error.message);
      return;
    }

    setProjects((prev) => [...prev, data as Project]);
    setNewName("");
    flashSaved();
  }

  async function toggleActive(project: Project) {
    const { error } = await supabase
      .from("projects")
      .update({ is_active: !project.is_active })
      .eq("id", project.id);

    if (error) {
      setError(error.message);
      return;
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, is_active: !p.is_active } : p
      )
    );
    flashSaved();
  }

  function startEditing(project: Project) {
    setEditingId(project.id);
    setEditingValue(project.name);
  }

  async function saveEditing(projectId: string) {
    if (!editingValue.trim()) {
      setEditingId(null);
      return;
    }

    const { error } = await supabase
      .from("projects")
      .update({ name: editingValue.trim() })
      .eq("id", projectId);

    if (error) {
      setError(error.message);
      return;
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, name: editingValue.trim() } : p
      )
    );
    setEditingId(null);
    flashSaved();
  }

  async function toggleAssignment(projectId: string, memberId: string) {
    const current = assignments[projectId] ?? [];
    const isAssigned = current.includes(memberId);

    if (isAssigned) {
      const { error } = await supabase
        .from("project_assignments")
        .delete()
        .eq("project_id", projectId)
        .eq("member_id", memberId);

      if (error) {
        setError(error.message);
        return;
      }

      setAssignments((prev) => ({
        ...prev,
        [projectId]: current.filter((id) => id !== memberId),
      }));
    } else {
      const { error } = await supabase
        .from("project_assignments")
        .insert({ project_id: projectId, member_id: memberId });

      if (error) {
        setError(error.message);
        return;
      }

      setAssignments((prev) => ({
        ...prev,
        [projectId]: [...current, memberId],
      }));
    }
    flashSaved();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold">Proyectos</h1>
        {savedFlash && (
          <span className="text-sm text-teal-dark font-medium">
            Cambios guardados
          </span>
        )}
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6 max-w-md">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del nuevo proyecto"
          className="flex-1 border border-line rounded px-3 py-2 outline-none focus:border-teal"
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-teal text-white font-medium rounded px-4 py-2 hover:bg-teal-dark transition-colors disabled:opacity-60"
        >
          {creating ? "Creando..." : "Crear"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {projects.length === 0 ? (
        <p className="text-ink-soft text-sm">
          Todavía no creaste ningún proyecto.
        </p>
      ) : (
        <div className="bg-panel border border-line rounded divide-y divide-line max-w-2xl">
          {projects.map((project) => {
            const assignedIds = assignments[project.id] ?? [];
            const isExpanded = expandedId === project.id;

            return (
              <div key={project.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-4">
                  {editingId === project.id ? (
                    <input
                      autoFocus
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => saveEditing(project.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditing(project.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="flex-1 border border-teal rounded px-2 py-1 outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => startEditing(project)}
                      className={`flex-1 text-left font-medium ${
                        project.is_active ? "" : "text-ink-soft line-through"
                      }`}
                    >
                      {project.name}
                    </button>
                  )}

                  <button
                    onClick={() => toggleActive(project)}
                    className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 transition-colors ${
                      project.is_active
                        ? "bg-mint text-teal-dark"
                        : "bg-line text-ink-soft"
                    }`}
                  >
                    {project.is_active ? "Activo" : "Inactivo"}
                  </button>
                </div>

                {members.length > 0 && (
                  <>
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : project.id)
                      }
                      className="text-xs text-teal-dark font-medium mt-2"
                    >
                      {isExpanded
                        ? "Ocultar miembros asignados"
                        : `Miembros asignados (${assignedIds.length})`}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 pl-1 space-y-2">
                        {members.map((member) => (
                          <label
                            key={member.id}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={assignedIds.includes(member.id)}
                              onChange={() =>
                                toggleAssignment(project.id, member.id)
                              }
                              className="accent-teal"
                            />
                            {member.full_name}
                          </label>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
