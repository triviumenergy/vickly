import { redirect } from "next/navigation";

// Con login por Google no hace falta un formulario de registro
// separado: el mismo botón de Google crea la cuenta la primera vez
// y loguea las veces siguientes. Esta página queda solo por si algo
// todavía apunta a /signup.
export default function SignupPage() {
  redirect("/login");
}
