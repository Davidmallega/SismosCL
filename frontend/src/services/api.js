// services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const BASE = `${API_URL}/api`;

async function manejarRespuesta(r) {
  if (!r.ok) {
    const d = await r.json().catch(() => ({}));
    throw new Error(d.error || `Error HTTP ${r.status}`);
  }
  return r.json();
}

export const api = {
  resumen: () => fetch(`${BASE}/resumen`).then(manejarRespuesta),
  ultimo: () => fetch(`${BASE}/ultimo`).then(manejarRespuesta),
  porAño: () => fetch(`${BASE}/por-anio`).then(manejarRespuesta),
  porMagnitud: () => fetch(`${BASE}/por-magnitud`).then(manejarRespuesta),
  top: (limite = 10) => fetch(`${BASE}/top?limit=${limite}`).then(manejarRespuesta),
};
