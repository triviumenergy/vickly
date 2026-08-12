import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <span className="font-display text-xl font-extrabold">Vickly</span>
        <Link
          href="/login"
          className="text-sm font-medium border border-line rounded px-4 py-2 hover:bg-cream transition-colors"
        >
          Ingresar
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-block bg-mint text-teal-dark text-xs font-bold px-3 py-1 rounded-full mb-6">
          100% gratuito
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
          Enterate en qué se te va el tiempo
        </h1>
        <p className="text-ink-soft text-lg mb-8 max-w-xl mx-auto">
          Vickly es una herramienta simple de time tracking para vos o para
          tu equipo. Sin planes pagos, sin límites escondidos.
        </p>
        <Link
          href="/login"
          className="inline-block bg-teal text-white font-medium rounded px-6 py-3 hover:bg-teal-dark transition-colors"
        >
          Empezar gratis
        </Link>
      </section>

      {/* Problema / solución */}
      <section className="max-w-4xl mx-auto px-6 py-16 grid sm:grid-cols-2 gap-8">
        <div className="bg-panel border border-line rounded p-6">
          <h2 className="font-display font-bold text-lg mb-2">
            El problema
          </h2>
          <p className="text-ink-soft">
            Entre proyectos, tareas y reuniones, es difícil saber realmente
            en qué se te va el día — sea que trabajes solo o con un equipo.
          </p>
        </div>
        <div className="bg-panel border border-line rounded p-6">
          <h2 className="font-display font-bold text-lg mb-2">
            La solución
          </h2>
          <p className="text-ink-soft">
            Registrá el tiempo por proyecto, mirá reportes simples y claros,
            y tomá decisiones con información real — sin complicarte.
          </p>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="font-display font-extrabold text-2xl text-center mb-10">
          Cómo funciona
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-9 h-9 rounded-full bg-teal-dark text-white flex items-center justify-center font-bold mx-auto mb-3">
              1
            </div>
            <p className="font-medium mb-1">Te registrás</p>
            <p className="text-sm text-ink-soft">
              Con tu cuenta de Google, en segundos.
            </p>
          </div>
          <div className="text-center">
            <div className="w-9 h-9 rounded-full bg-teal-dark text-white flex items-center justify-center font-bold mx-auto mb-3">
              2
            </div>
            <p className="font-medium mb-1">Elegís cómo trabajar</p>
            <p className="text-sm text-ink-soft">
              Solo, o invitando a tu equipo — cuando quieras.
            </p>
          </div>
          <div className="text-center">
            <div className="w-9 h-9 rounded-full bg-teal-dark text-white flex items-center justify-center font-bold mx-auto mb-3">
              3
            </div>
            <p className="font-medium mb-1">Registrás tu tiempo</p>
            <p className="text-sm text-ink-soft">
              Por proyecto, con reportes simples y un calendario claro.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-8 text-center text-sm text-ink-soft">
        Impulsado por Evolutia y GG Desarrollos
      </footer>
    </main>
  );
}
