# SismosCL — Dashboard sísmico con BigQuery

Dashboard fullstack desplegado en producción. Frontend React que visualiza ~35 años de actividad sísmica en Chile consultando Google BigQuery en tiempo real mediante queries SQL analíticas.

---

## Vista previa

| Modo claro | Modo oscuro |
|-----------|-------------|
| ![App modo claro](docs/img/app-light.png) | ![App modo oscuro](docs/img/app-dark.png) |

---

## ¿Qué hace?

Muestra un dashboard con la actividad sísmica de Chile desde 1990, cargada desde la API pública del USGS mediante un script ETL. Cada visita al dashboard ejecuta queries SQL reales en BigQuery sobre ~42,000 sismos.

- **Hero card** — el sismo más reciente con magnitud, lugar y coordenadas
- **KPIs** — total histórico, magnitud máxima, promedio y eventos con tsunami
- **Gráfico de barras** — volumen anual de sismos desde 1990
- **Distribución por magnitud** — cantidad de sismos en cada rango de intensidad
- **Top 10 más fuertes** — incluye el 27F de 2010 (Maule, M 8.8)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 · Vite · Tailwind CSS · Recharts |
| Backend (API) | Node.js 20 · Express |
| Datos | Google BigQuery (dataset `sismoscl`, tabla `sismos`) |
| ETL | Script Node.js — USGS API → BigQuery |
| Cómputo | Google Cloud Run (serverless) |

---

## Arquitectura del sistema

![Arquitectura del sistema](docs/img/arquitectura-sistema.png)

## Pipeline ETL (ingesta)

![Flujo ETL](docs/img/flujo-etl.png)

---

## Evidencia de despliegue

### App desplegada

![App Top 10](docs/img/app-top10.png)

### Servicio activo en Cloud Run

![Cloud Run sismoscl-api](docs/img/cloudrun-sismoscl.png)

### Variables de entorno del contenedor

Las variables se inyectan en el momento del despliegue. Ningún valor está hardcodeado en el código.

![Variables de entorno](docs/img/cloudrun-envvars.png)

### Logs en producción

Los logs muestran las queries SQL ejecutadas por el dashboard al cargar.

![Logs de Cloud Run](docs/img/cloudrun-logs.png)

### BigQuery — Dataset y tabla

El dataset `sismoscl` con la tabla `sismos` particionada por año.

![BigQuery dataset](docs/img/bigquery-dataset.png)

### Esquema y número de filas

![BigQuery tabla](docs/img/bigquery-tabla.png)

### Vista previa de los datos

![BigQuery preview](docs/img/bigquery-preview.png)

### Query SQL ejecutada manualmente

![BigQuery query](docs/img/bigquery-query.png)

---

## Estructura

```
04-sismoscl/
├── backend/
│   ├── index.js                    API Express
│   ├── Dockerfile
│   ├── scripts/
│   │   └── ingestar.js             ETL: USGS → BigQuery (corre una sola vez)
│   └── src/
│       ├── config/bigquery.js      Cliente BigQuery + variables de entorno
│       ├── controllers/
│       │   └── sismosController.js Queries SQL analíticas
│       └── routes/
│           └── sismos.js
├── frontend/
│   └── src/
│       ├── hooks/useDashboard.js   Carga todos los endpoints en paralelo
│       ├── services/api.js
│       └── components/
│           ├── HeroUltimo.jsx
│           ├── KpiCard.jsx
│           ├── GraficoPorAño.jsx
│           ├── GraficoPorMagnitud.jsx
│           └── TopSismos.jsx
└── docs/
    └── img/
```

---

## Correr en local

**Prerequisito:** haber corrido la ingesta ETL al menos una vez.

**Ingesta ETL (una sola vez)**
```bash
cd backend
npm install
gcloud auth application-default login
gcloud auth application-default set-quota-project sismoscl
cp .env.example .env
npm run ingestar       # descarga ~35 años del USGS y carga a BigQuery (~3-5 min)
```

**Backend**
```bash
npm run dev            # http://localhost:8080
```

**Frontend**
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

---

## Despliegue en Cloud Run

```bash
cd backend
gcloud run deploy sismoscl-api `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --port 8080 `
  --set-env-vars GOOGLE_CLOUD_PROJECT=sismoscl,DATASET_ID=sismoscl,TABLE_ID=sismos
```

Requiere dos roles de IAM en la cuenta de servicio de Cloud Run:
```bash
gcloud projects add-iam-policy-binding sismoscl \
  --member=serviceAccount:954810838081-compute@developer.gserviceaccount.com \
  --role=roles/bigquery.dataViewer

gcloud projects add-iam-policy-binding sismoscl \
  --member=serviceAccount:954810838081-compute@developer.gserviceaccount.com \
  --role=roles/bigquery.jobUser
```

---

## Endpoints de la API

| Método | Ruta | Datos |
|--------|------|-------|
| GET | `/api/resumen` | KPIs: total, magnitud máx/prom, tsunamis |
| GET | `/api/ultimo` | Sismo más reciente |
| GET | `/api/por-anio` | Conteo anual de sismos |
| GET | `/api/por-magnitud` | Distribución por rangos de magnitud |
| GET | `/api/top?limit=10` | Top N sismos más fuertes |
| GET | `/health` | Estado del servicio |

---

## Decisiones técnicas

- **BigQuery vs. base de datos transaccional**: BigQuery está optimizado para analytics — consultar millones de filas con SQL en segundos sin gestionar índices ni infraestructura.
- **ETL una sola vez**: los datos sísmicos históricos no cambian. El script carga ~42,000 registros una vez; las queries leen esa tabla sin tocar la API del USGS en cada visita.
- **Partición por año**: la tabla está particionada por `fecha`. Las queries que filtran por año escanean solo las particiones necesarias, reduciendo costo y latencia.
- **Dos roles IAM separados**: BigQuery distingue entre leer datos (`dataViewer`) y ejecutar queries (`jobUser`). Cloud Run necesita ambos.
- **Queries parametrizadas** (`@parametro`): el endpoint `/api/top` acepta el límite desde la URL y lo pasa como parámetro al cliente BigQuery para evitar inyección SQL.
- **Promise.all en el dashboard**: los cinco endpoints se llaman en paralelo al cargar la página, reduciendo el tiempo total de carga.
- **Sin credenciales en el código**: Application Default Credentials en local, cuenta de servicio propia de Cloud Run en producción.
