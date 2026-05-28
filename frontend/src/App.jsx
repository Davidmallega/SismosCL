import { useDashboard } from './hooks/useDashboard.js';
import { useTema } from './hooks/useTema.js';
import { HeroUltimo } from './components/HeroUltimo.jsx';
import { KpiCard } from './components/KpiCard.jsx';
import { GraficoPorAño } from './components/GraficoPorAño.jsx';
import { GraficoPorMagnitud } from './components/GraficoPorMagnitud.jsx';
import { TopSismos } from './components/TopSismos.jsx';

export default function App() {
  const { resumen, ultimo, porAño, porMagnitud, top, cargando, error } = useDashboard();
  const { oscuro, alternar } = useTema();

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-600 text-lg text-white">
              🌎
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">SismosCL</h1>
              <p className="font-mono text-xs text-text-muted">BigQuery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-text-muted sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Sobre BigQuery
            </span>
            <button
              onClick={alternar}
              className="rounded-md border border-border px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-2"
            >
              {oscuro ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-md border border-error/30 bg-error-bg p-4 text-sm text-error">
            {error}
            <p className="mt-1 text-xs text-text-muted">
              ¿Ya ejecutaste <code className="font-mono">npm run ingestar</code>? Sin datos en BigQuery la API no puede responder.
            </p>
          </div>
        )}

        {cargando && (
          <div className="space-y-6">
            <div className="h-32 animate-pulse rounded-md bg-surface-2" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-md bg-surface-2" />)}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-72 animate-pulse rounded-md bg-surface-2" />
              <div className="h-72 animate-pulse rounded-md bg-surface-2" />
            </div>
          </div>
        )}

        {!cargando && !error && (
          <div className="space-y-8">
            <HeroUltimo ultimo={ultimo} />

            <section>
              <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-text-muted">
                Resumen histórico ({resumen?.año_inicio}–{resumen?.año_fin})
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <KpiCard etiqueta="Total registrados" valor={resumen?.total?.toLocaleString('es-CL') ?? '—'} />
                <KpiCard etiqueta="Magnitud máxima" valor={resumen?.magnitud_maxima ?? '—'} acento="text-error" />
                <KpiCard etiqueta="Magnitud promedio" valor={resumen?.magnitud_promedio ?? '—'} />
                <KpiCard etiqueta="Con tsunami" valor={resumen?.con_tsunami ?? '—'} acento="text-warning" />
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <GraficoPorAño datos={porAño} />
              <GraficoPorMagnitud datos={porMagnitud} />
            </section>

            <section>
              <TopSismos sismos={top} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
