export default function MiPlanPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold mb-6">Mi plan</h1>

      <div className="bg-panel border border-line rounded p-6 max-w-md">
        <div className="inline-block bg-mint text-teal-dark text-xs font-bold px-3 py-1 rounded-full mb-4">
          Plan gratuito
        </div>
        <p className="text-ink-soft mb-6">
          Vickly es 100% gratuito. No hay límites de uso ni planes pagos.
        </p>
        <p className="text-xs text-ink-soft border-t border-line pt-4">
          Impulsado por Evolutia y GG Desarrollos
        </p>
      </div>
    </div>
  );
}
