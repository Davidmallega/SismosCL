import { BigQuery } from '@google-cloud/bigquery';

export const bigquery = new BigQuery();

export const DATASET_ID = process.env.DATASET_ID || 'sismoscl';
export const TABLE_ID = process.env.TABLE_ID || 'sismos';

export const TABLA_COMPLETA = `\`${process.env.GOOGLE_CLOUD_PROJECT}.${DATASET_ID}.${TABLE_ID}\``;
