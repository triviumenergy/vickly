import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// A esta ruta te trae el link que llega por correo al confirmar
// la cuenta. Intercambia el código por una sesión real y te manda
// directo al dashboard.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
