import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminTable from "./admin-table";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();

  const { data: usersData, error: usersError } =
    await admin.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = usersData?.users ?? [];

  const { data: workspaces, error: workspacesError } = await admin
    .from("workspaces")
    .select("id, owner_id, name, created_at");

  const { data: memberRows, error: membersError } = await admin
    .from("workspace_members")
    .select("id, workspace_id");

  const anyError = usersError || workspacesError || membersError;

  if (anyError) {
    return (
      <div>
        <h1 className="font-display text-2xl font-extrabold mb-6">
          Panel de administrador
        </h1>
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-4 text-sm">
          <p className="font-medium mb-2">
            Hubo un error trayendo los datos:
          </p>
          {usersError && <p>Usuarios: {usersError.message}</p>}
          {workspacesError && <p>Workspaces: {workspacesError.message}</p>}
          {membersError && <p>Miembros: {membersError.message}</p>}
        </div>
      </div>
    );
  }

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
