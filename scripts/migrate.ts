import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Client } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.local') });

const dbPassword = process.env.CARTLY_DB_PASSWORD;
const supabaseUrl = process.env.SUPABASE_URL;

if (!dbPassword || !supabaseUrl) {
  throw new Error('Missing CARTLY_DB_PASSWORD or SUPABASE_URL in .env.local');
}

const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
const connectionString = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;

const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log(`Connected to db.${projectRef}.supabase.co`);

  try {
    await client.query('begin');
    for (const file of files) {
      console.log(`Running ${file}...`);
      const sql = readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
    }
    await client.query('commit');
    console.log('Migrations applied successfully.');
  } catch (err) {
    await client.query('rollback');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
