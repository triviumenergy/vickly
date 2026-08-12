import { createClient } from "@/lib/supabase/server";

export default async function MiembrosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const { data: members } = await supabase
    .from("workspace_members")
    .select("id, full_name, email")
    .eq("workspace_id", workspace!.id)
    .order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">Miembros</h1>

      <div className="bg-panel border border-line rounded divide-y divide-line">
        {members?.map((member) => (
          <div key={member.id} className="px-5 py-3">
            <p className="font-medium">{member.full_name}</p>
            {member.email && (
              <p className="text-sm text-ink-soft">{member.email}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-cream border-l-4 border-teal rounded p-4 text-sm mt-4">
        Agregar, editar y eliminar miembros desde acá se construye en el
        próximo paso, junto con la asignación a proyectos.
      </div>
    </div>
  );
}
