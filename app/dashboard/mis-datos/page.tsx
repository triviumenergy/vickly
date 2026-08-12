import { createClient } from "@/lib/supabase/server";

export default async function MisDatosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">
        Mis datos
      </h1>

      <div className="bg-panel border border-line rounded p-6 max-w-md">
        <label className="block text-sm font-medium mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          disabled
          value={user?.email ?? ""}
          className="w-full border border-line rounded px-3 py-2 mb-4 bg-cream/50 text-ink-soft"
        />

        <label className="block text-sm font-medium mb-1">Teléfono</label>
        <input
          type="tel"
          placeholder="Sin cargar"
          className="w-full border border-line rounded px-3 py-2 mb-4 outline-none focus:border-teal"
        />

        <label className="block text-sm font-medium mb-1">
          Nombre de la empresa
        </label>
        <input
          type="text"
          placeholder="Sin cargar"
          className="w-full border border-line rounded px-3 py-2 mb-4 outline-none focus:border-teal"
        />

        <label className="block text-sm font-medium mb-1">
          Razón social
        </label>
        <input
          type="text"
          placeholder="Sin cargar"
          className="w-full border border-line rounded px-3 py-2 mb-4 outline-none focus:border-teal"
        />

        <div className="bg-cream border-l-4 border-teal rounded p-3 text-sm">
          El botón "Guardar cambios" y la conexión real con la base de datos
          se agregan en el próximo paso — por ahora es solo la pantalla.
        </div>
      </div>
    </div>
  );
}
