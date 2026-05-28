import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORES = ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#7f1d1d'];

export function GraficoPorMagnitud({ datos }) {
  return (
    <div className="rounded-md border border-border bg-surface p-5 shadow-sm">
      <h3 className="mb-1 text-base font-semibold">Distribución por magnitud</h3>
      <p className="mb-4 text-xs text-text-muted">Cuántos sismos hubo de cada intensidad</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={datos} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <YAxis
            type="category"
            dataKey="rango"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            width={80}
            tickFormatter={(v) => v.split(' (')[0]}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontSize: '13px',
            }}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]}>
            {datos.map((_, i) => (
              <Cell key={i} fill={COLORES[i] || COLORES[COLORES.length - 1]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
