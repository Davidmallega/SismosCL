export function TopSismos({ sismos }) {
  if (!sismos || sismos.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="border-b border-border p-5">
        <h3 className="text-base font-semibold">Top 10 más fuertes</h3>
        <p className="mt-1 text-xs text-text-muted">Los sismos más intensos registrados</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-text-muted">
              <th className="px-5 py-2.5 font-medium">#</th>
              <th className="px-5 py-2.5 font-medium">Magnitud</th>
              <th className="px-5 py-2.5 font-medium">Lugar</th>
              <th className="px-5 py-2.5 font-medium">Fecha</th>
              <th className="px-5 py-2.5 font-medium">Tsunami</th>
            </tr>
          </thead>
          <tbody>
            {sismos.map((s, i) => {
              const fecha = new Date(s.fecha.value || s.fecha);
              return (
                <tr key={s.id} className="border-b border-border last:border-0 transition-colors hover:bg-surface-2">
                  <td className="px-5 py-3 font-mono text-xs text-text-muted">{i + 1}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono font-semibold ${s.magnitud >= 8 ? 'text-error' : s.magnitud >= 7 ? 'text-warning' : 'text-text'}`}>
                      {s.magnitud}
                    </span>
                  </td>
                  <td className="px-5 py-3">{s.lugar}</td>
                  <td className="px-5 py-3 font-mono text-xs text-text-muted">
                    {fecha.toLocaleDateString('es-CL', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    {s.tsunami ? (
                      <span className="rounded-full bg-error-bg px-2 py-0.5 text-xs font-medium text-error">Sí</span>
                    ) : (
                      <span className="text-xs text-text-subtle">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
