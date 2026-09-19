import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { Client } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.local'), quiet: true });

const dbPassword = process.env.CARTLY_DB_PASSWORD;
const supabaseUrl = process.env.SUPABASE_URL;

if (!dbPassword || !supabaseUrl) {
  throw new Error('Missing CARTLY_DB_PASSWORD or SUPABASE_URL in .env.local');
}

const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
// The direct host (db.<ref>.supabase.co) is IPv6-only. On an IPv4-only network set
// CARTLY_DB_HOST to your project's session-pooler host (Supabase dashboard ->
// Connect -> Session pooler), e.g. aws-1-eu-west-1.pooler.supabase.com
const poolerHost = process.env.CARTLY_DB_HOST;
const dbHost = poolerHost ?? `db.${projectRef}.supabase.co`;
const dbUser = poolerHost ? `postgres.${projectRef}` : 'postgres';
const connectionString = `postgresql://${dbUser}:${encodeURIComponent(dbPassword)}@${dbHost}:5432/postgres`;

const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log(`Connected to ${dbHost}`);

  try {
    await client.query(`
      create table if not exists public.schema_migrations (
        name text primary key,
        applied_at timestamptz not null default now()
      );
      alter table public.schema_migrations enable row level security; -- no policies: hidden from the API
    `);

    const { rows } = await client.query<{ name: string }>('select name from public.schema_migrations');
    const applied = new Set(rows.map((r) => r.name));

    // Databases created before migration tracking existed already have 0001.
    if (applied.size === 0) {
      const { rows: probe } = await client.query<{ t: string | null }>("select to_regclass('public.products') as t");
      if (probe[0]?.t) {
        await client.query("insert into public.schema_migrations (name) values ('0001_init.sql')");
        applied.add('0001_init.sql');
        console.log('Recorded existing 0001_init.sql as applied.');
      }
    }

    const pending = files.filter((f) => !applied.has(f));
    if (pending.length === 0) {
      console.log('Database is up to date.');
      return;
    }

    for (const file of pending) {
      console.log(`Applying ${file}...`);
      const sql = readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query('insert into public.schema_migrations (name) values ($1)', [file]);
        await client.query('commit');
      } catch (err) {
        await client.query('rollback');
        throw err;
      }
    }
    console.log('Migrations applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
