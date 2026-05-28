import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export function useDashboard() {
  const [datos, setDatos] = useState({
    resumen: null,
    ultimo: null,
    porAño: [],
    porMagnitud: [],
    top: [],
  });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        setCargando(true);
        setError(null);
        const [resumen, ultimo, porAño, porMagnitud, top] = await Promise.all([
          api.resumen(),
          api.ultimo(),
          api.porAño(),
          api.porMagnitud(),
          api.top(10),
        ]);
        if (!activo) return;
        setDatos({ resumen, ultimo, porAño, porMagnitud, top });
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => { activo = false; };
  }, []);

  return { ...datos, cargando, error };
}
