// components/KpiCard.jsx
// Tarjeta de métrica genérica reutilizable.
export function KpiCard({ etiqueta, valor, sufijo, acento }) {
  return (
    <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-text-muted">{etiqueta}</p>
      <p className={`mt-2 text-3xl font-semibold ${acento || 'text-text'}`}>
        {valor}
        {sufijo && <span className="ml-1 text-base font-normal text-text-muted">{sufijo}</span>}
      </p>
    </div>
  );
}
