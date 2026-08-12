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

  return (
    <ProjectsManager
      workspaceId={workspace!.id}
      initialProjects={projects ?? []}
    />
  );
}
