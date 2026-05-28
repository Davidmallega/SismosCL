import { bigquery, DATASET_ID, TABLE_ID } from '../src/config/bigquery.js';

const AÑO_INICIO = 1990;
const AÑO_FIN = new Date().getFullYear();
const MAGNITUD_MIN = 4.0;

const CHILE_BBOX = {
  minLat: -56.5,
  maxLat: -17.5,
  minLng: -76.0,
  maxLng: -66.0,
};

async function descargarAño(año) {
  const inicio = `${año}-01-01`;
  const fin = `${año}-12-31`;
  const url =
    `https://earthquake.usgs.gov/fdsnws/event/1/query?` +
    `format=geojson&starttime=${inicio}&endtime=${fin}` +
    `&minlatitude=${CHILE_BBOX.minLat}&maxlatitude=${CHILE_BBOX.maxLat}` +
    `&minlongitude=${CHILE_BBOX.minLng}&maxlongitude=${CHILE_BBOX.maxLng}` +
    `&minmagnitude=${MAGNITUD_MIN}`;

  console.log(`  📡 Descargando ${año}...`);
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`USGS respondió ${respuesta.status} para el año ${año}`);
  }
  const datos = await respuesta.json();
  return datos.features || [];
}

function transformar(feature) {
  const p = feature.properties;
  const [lng, lat, profundidad] = feature.geometry.coordinates;

  return {
    id: feature.id,
    magnitud: p.mag,
    lugar: p.place || 'Desconocido',
    fecha: new Date(p.time).toISOString(),
    anio: new Date(p.time).getUTCFullYear(),
    latitud: lat,
    longitud: lng,
    profundidad_km: profundidad,
    tsunami: p.tsunami === 1,
    significancia: p.sig || 0,
    tipo_magnitud: p.magType || null,
  };
}

const ESQUEMA = [
  { name: 'id', type: 'STRING', mode: 'REQUIRED' },
  { name: 'magnitud', type: 'FLOAT', mode: 'NULLABLE' },
  { name: 'lugar', type: 'STRING', mode: 'NULLABLE' },
  { name: 'fecha', type: 'TIMESTAMP', mode: 'REQUIRED' },
  { name: 'anio', type: 'INTEGER', mode: 'REQUIRED' },
  { name: 'latitud', type: 'FLOAT', mode: 'NULLABLE' },
  { name: 'longitud', type: 'FLOAT', mode: 'NULLABLE' },
  { name: 'profundidad_km', type: 'FLOAT', mode: 'NULLABLE' },
  { name: 'tsunami', type: 'BOOLEAN', mode: 'NULLABLE' },
  { name: 'significancia', type: 'INTEGER', mode: 'NULLABLE' },
  { name: 'tipo_magnitud', type: 'STRING', mode: 'NULLABLE' },
];

async function prepararBigQuery() {
  const [datasets] = await bigquery.getDatasets();
  const existe = datasets.some((d) => d.id === DATASET_ID);
  if (!existe) {
    console.log(`📦 Creando dataset "${DATASET_ID}"...`);
    await bigquery.createDataset(DATASET_ID, { location: 'us-central1' });
  } else {
    console.log(`📦 Dataset "${DATASET_ID}" ya existe.`);
  }

  const dataset = bigquery.dataset(DATASET_ID);
  const [tablas] = await dataset.getTables();
  const tablaExiste = tablas.some((t) => t.id === TABLE_ID);
  if (tablaExiste) {
    console.log(`🗑️  Eliminando tabla "${TABLE_ID}" anterior para recargar limpia...`);
    await dataset.table(TABLE_ID).delete();
  }
  console.log(`🛠️  Creando tabla "${TABLE_ID}"...`);
  await dataset.createTable(TABLE_ID, {
    schema: ESQUEMA,
    timePartitioning: { type: 'YEAR', field: 'fecha' },
  });
}

async function cargarFilas(filas) {
  const tabla = bigquery.dataset(DATASET_ID).table(TABLE_ID);
  const LOTE = 500;
  for (let i = 0; i < filas.length; i += LOTE) {
    const chunk = filas.slice(i, i + LOTE);
    await tabla.insert(chunk);
  }
}

async function main() {
  console.log(`\n🌎 Ingesta SismosCL: ${AÑO_INICIO}-${AÑO_FIN}, M≥${MAGNITUD_MIN}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await prepararBigQuery();
  console.log('\n📡 Descargando del USGS año por año...');

  const todas = [];
  for (let año = AÑO_INICIO; año <= AÑO_FIN; año++) {
    const features = await descargarAño(año);
    const filas = features.map(transformar);
    todas.push(...filas);
    console.log(`     → ${filas.length} sismos en ${año}`);
  }

  console.log(`\n📊 Total descargado: ${todas.length} sismos`);
  console.log(`💾 Cargando a BigQuery...`);
  await cargarFilas(todas);
  console.log(`\n✅ Listo. ${todas.length} sismos cargados en ${DATASET_ID}.${TABLE_ID}`);
  console.log(`   Ahora puedes arrancar la API con: npm run dev\n`);
}

main().catch((err) => {
  console.error('\n❌ Error en la ingesta:', err.message);
  process.exit(1);
});
