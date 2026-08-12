import { createClient } from "@/lib/supabase/server";
import TimeTracker from "./time-tracker";
import CalendarView from "./calendar-view";

export default async function InicioPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("owner_id", user!.id)
    .single();

  const { data: allProjects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("workspace_id", workspace!.id)
    .order("created_at", { ascending: true });

  const { data: activeProjectsFull } = await supabase
    .from("projects")
    .select("id, name")
    .eq("workspace_id", workspace!.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const { data: members } = await supabase
    .from("workspace_members")
    .select("id, full_name")
    .eq("workspace_id", workspace!.id)
    .order("created_at", { ascending: true });

  const projectIds = (allProjects ?? []).map((p) => p.id);

  const { data: assignmentRows } = await supabase
    .from("project_assignments")
    .select("project_id, member_id")
    .in("project_id", projectIds.length > 0 ? projectIds : [""]);

  const assignments: Record<string, string[]> = {};
  (assignmentRows ?? []).forEach((row) => {
    if (!assignments[row.project_id]) assignments[row.project_id] = [];
    assignments[row.project_id].push(row.member_id);
  });

  const { data: entries } = await supabase
    .from("time_entries")
    .select("id, entry_date, duration_minutes, note, project_id, member_id")
    .order("entry_date", { ascending: false })
    .limit(20);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">Inicio</h1>

      <TimeTracker
        projects={activeProjectsFull ?? []}
        members={members ?? []}
        assignments={assignments}
        initialEntries={entries ?? []}
      />

      <div className="mt-8">
        <h2 className="font-display font-bold mb-3">
          Calendario de horas
        </h2>
        <CalendarView allProjects={allProjects ?? []} />
      </div>
    </div>
  );
}
