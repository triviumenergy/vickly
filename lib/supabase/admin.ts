import { createClient } from "@supabase/supabase-js";

// Este cliente usa la "service role key" de Supabase, que ignora
// todas las reglas de seguridad (RLS) y puede ver los datos de
// CUALQUIER usuario. Por eso:
// - Esta función solo se puede llamar desde código de servidor
//   (páginas async de Next.js, nunca desde un "use client").
// - La variable SUPABASE_SERVICE_ROLE_KEY NO lleva el prefijo
//   NEXT_PUBLIC_ a propósito, para que Next.js jamás la incluya
//   en el código que baja al navegador.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
