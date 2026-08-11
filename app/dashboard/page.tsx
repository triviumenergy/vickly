import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

// Este dashboard es todavía un placeholder: sirve para confirmar que
// el login funciona y que el workspace se creó solo al registrarse.
// El dashboard real (proyectos, calendario, reportes) se construye
// en un paso aparte.
export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, created_at")
    .eq("owner_id", user.id)
    .single();

  return (
    <main className="min-h-screen px-6 py-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
        <LogoutButton />
      </div>

      <div className="bg-panel border border-line rounded p-6">
        <p className="text-ink-soft mb-1">Sesión iniciada como</p>
        <p className="font-medium mb-4">{user.email}</p>

        {workspace ? (
          <>
            <p className="text-ink-soft mb-1">Tu workspace</p>
            <p className="font-medium">{workspace.name}</p>
          </>
        ) : (
          <p className="text-red-600 text-sm">
            No se encontró un workspace para este usuario — revisar el
            trigger en Supabase.
          </p>
        )}
      </div>
    </main>
  );
}
