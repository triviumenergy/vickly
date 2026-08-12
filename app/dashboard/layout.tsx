import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, onboarding_completed")
    .eq("owner_id", user.id)
    .single();

  if (!workspace) {
    redirect("/login");
  }

  if (!workspace.onboarding_completed) {
    redirect("/onboarding");
  }

  const { count: membersCount } = await supabase
    .from("workspace_members")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id);

  const isAdmin = user.email === process.env.ADMIN_EMAIL;

  return (
    <DashboardShell
      workspaceName={workspace.name}
      userEmail={user.email ?? ""}
      showMembers={(membersCount ?? 0) > 0}
      isAdmin={isAdmin}
    >
      {children}
    </DashboardShell>
  );
}
