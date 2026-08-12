import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminTable from "./admin-table";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Solo el founder puede ver esta página. Cualquier otra persona
  // que intente entrar por URL directa es redirigida al dashboard.
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  const { data: usersData } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  const authUsers = usersData?.users ?? [];

  const { data: workspaces } = await admin
    .from("workspaces")
    .select("id, owner_id, name, created_at");

  const { data: memberRows } = await admin
    .from("workspace_members")
    .select("id, workspace_id");

  const memberCountByWorkspace: Record<string, number> = {};
  (memberRows ?? []).forEach((m) => {
    memberCountByWorkspace[m.workspace_id] =
      (memberCountByWorkspace[m.workspace_id] ?? 0) + 1;
  });

  const rows = authUsers.map((authUser) => {
    const workspace = (workspaces ?? []).find(
      (w) => w.owner_id === authUser.id
    );
    const memberCount = workspace
      ? memberCountByWorkspace[workspace.id] ?? 0
      : 0;

    return {
      id: authUser.id,
      email: authUser.email ?? "—",
      createdAt: authUser.created_at,
      lastSignInAt: authUser.last_sign_in_at ?? null,
      workspaceName: workspace?.name ?? "—",
      accountType: (memberCount > 0 ? "Equipo" : "Individual") as
        | "Equipo"
        | "Individual",
      memberCount,
    };
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">
        Panel de administrador
      </h1>
      <AdminTable rows={rows} />
    </div>
  );
}
