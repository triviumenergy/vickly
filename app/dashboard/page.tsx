import { createClient } from "@/lib/supabase/server";
import TimeTracker from "./time-tracker";

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

  const { data: projects } = await supabase
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

  const { data: entries } = await supabase
    .from("time_entries")
    .select("id, entry_date, duration_minutes, note, project_id, member_id")
    .in("project_id", (projects ?? []).map((p) => p.id))
    .order("entry_date", { ascending: false })
    .limit(20);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">Inicio</h1>

      <TimeTracker
        projects={projects ?? []}
        members={members ?? []}
        initialEntries={entries ?? []}
      />
    </div>
  );
}
