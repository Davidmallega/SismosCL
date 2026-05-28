import { bigquery, TABLA_COMPLETA } from '../config/bigquery.js';

async function consultar(query, params = {}) {
  const [filas] = await bigquery.query({ query, params });
  return filas;
}

export async function resumen(req, res) {
  try {
    const query = `
      SELECT
        COUNT(*) AS total,
        ROUND(AVG(magnitud), 2) AS magnitud_promedio,
        MAX(magnitud) AS magnitud_maxima,
        MIN(anio) AS anio_inicio,
        MAX(anio) AS anio_fin,
        COUNTIF(tsunami) AS con_tsunami
      FROM ${TABLA_COMPLETA}
    `;
    const [datos] = await consultar(query);
    res.status(200).json(datos);
  } catch (error) {
    console.error('Error en /resumen:', error.message);
    res.status(500).json({ error: 'No se pudo obtener el resumen.' });
  }
}

export async function ultimo(req, res) {
  try {
    const query = `
      SELECT id, magnitud, lugar, fecha, latitud, longitud, profundidad_km
      FROM ${TABLA_COMPLETA}
      ORDER BY fecha DESC
      LIMIT 1
    `;
    const [datos] = await consultar(query);
    res.status(200).json(datos || null);
  } catch (error) {
    console.error('Error en /ultimo:', error.message);
    res.status(500).json({ error: 'No se pudo obtener el último sismo.' });
  }
}

export async function porAnio(req, res) {
  try {
    const query = `
      SELECT anio, COUNT(*) AS total
      FROM ${TABLA_COMPLETA}
      GROUP BY anio
      ORDER BY anio ASC
    `;
    const datos = await consultar(query);
    res.status(200).json(datos);
  } catch (error) {
    console.error('Error en /por-anio:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la serie por año.' });
  }
}

export async function porMagnitud(req, res) {
  try {
    const query = `
      SELECT
        CASE
          WHEN magnitud < 5 THEN '4.0 - 4.9 (Leve)'
          WHEN magnitud < 6 THEN '5.0 - 5.9 (Moderado)'
          WHEN magnitud < 7 THEN '6.0 - 6.9 (Fuerte)'
          WHEN magnitud < 8 THEN '7.0 - 7.9 (Mayor)'
          ELSE '8.0+ (Devastador)'
        END AS rango,
        COUNT(*) AS total
      FROM ${TABLA_COMPLETA}
      GROUP BY rango
      ORDER BY MIN(magnitud)
    `;
    const datos = await consultar(query);
    res.status(200).json(datos);
  } catch (error) {
    console.error('Error en /por-magnitud:', error.message);
    res.status(500).json({ error: 'No se pudo obtener la distribución.' });
  }
}

export async function top(req, res) {
  try {
    const limite = Math.min(Number(req.query.limit) || 10, 50);
    const query = `
      SELECT id, magnitud, lugar, fecha, profundidad_km, tsunami
      FROM ${TABLA_COMPLETA}
      ORDER BY magnitud DESC
      LIMIT @limite
    `;
    const datos = await consultar(query, { limite });
    res.status(200).json(datos);
  } catch (error) {
    console.error('Error en /top:', error.message);
    res.status(500).json({ error: 'No se pudo obtener el top.' });
  }
}
