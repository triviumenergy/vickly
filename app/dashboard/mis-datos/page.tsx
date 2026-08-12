import { createClient } from "@/lib/supabase/server";
import MisDatosForm from "./mis-datos-form";

export default async function MisDatosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, phone, company_name, legal_name")
    .eq("owner_id", user!.id)
    .single();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">
        Mis datos
      </h1>
      <MisDatosForm email={user?.email ?? ""} workspace={workspace!} />
    </div>
  );
}
