function clasificar(mag) {
  if (mag >= 7) return { etiqueta: 'Mayor', color: 'text-error', acento: 'bg-error' };
  if (mag >= 6) return { etiqueta: 'Fuerte', color: 'text-warning', acento: 'bg-warning' };
  if (mag >= 5) return { etiqueta: 'Moderado', color: 'text-info', acento: 'bg-info' };
  return { etiqueta: 'Leve', color: 'text-success', acento: 'bg-success' };
}

export function HeroUltimo({ ultimo }) {
  if (!ultimo) return null;
  const c = clasificar(ultimo.magnitud);
  const fecha = new Date(ultimo.fecha.value || ultimo.fecha);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface shadow-sm">
      <div className={`h-1 ${c.acento}`} />
      <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto]">
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`text-5xl font-bold ${c.color}`}>{ultimo.magnitud}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-text-muted">Magnitud</div>
          <span className={`mt-2 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium ${c.color}`}>
            {c.etiqueta}
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-wide text-text-muted">Último sismo registrado</p>
          <h2 className="mt-1 text-xl font-semibold leading-snug">{ultimo.lugar}</h2>
          <p className="mt-2 text-sm text-text-muted">
            {fecha.toLocaleString('es-CL', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        </div>
        <div className="flex flex-col justify-center gap-1 text-sm">
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-text-muted">Profundidad</span>
            <span className="font-mono font-medium">{ultimo.profundidad_km?.toFixed(1)} km</span>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-text-muted">Coordenadas</span>
            <span className="font-mono text-xs">{ultimo.latitud?.toFixed(2)}, {ultimo.longitud?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
