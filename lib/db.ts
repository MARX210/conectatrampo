import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
export const db = databaseUrl ? neon(databaseUrl) : null;

export function requireDb() {
  if (!db) throw new Error('DATABASE_NOT_CONFIGURED');
  return db;
}
