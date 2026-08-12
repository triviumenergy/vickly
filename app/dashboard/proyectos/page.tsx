import { createClient } from "@/lib/supabase/server";
import ProjectsManager from "./projects-manager";

export default async function ProyectosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, is_active")
    .eq("workspace_id", workspace!.id)
    .order("created_at", { ascending: true });

  const { data: members } = await supabase
    .from("workspace_members")
    .select("id, full_name")
    .eq("workspace_id", workspace!.id)
    .order("created_at", { ascending: true });

  const projectIds = (projects ?? []).map((p) => p.id);

  const { data: assignmentRows } = await supabase
    .from("project_assignments")
    .select("project_id, member_id")
    .in("project_id", projectIds.length > 0 ? projectIds : [""]);

  const assignments: Record<string, string[]> = {};
  (assignmentRows ?? []).forEach((row) => {
    if (!assignments[row.project_id]) assignments[row.project_id] = [];
    assignments[row.project_id].push(row.member_id);
  });

  return (
    <ProjectsManager
      workspaceId={workspace!.id}
      initialProjects={projects ?? []}
      members={members ?? []}
      initialAssignments={assignments}
    />
  );
}
