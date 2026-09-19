// Loads the curated demo catalog (scripts/catalog.ts) into Supabase. Idempotent:
// safe to re-run. Run `npm run images:build` first so the referenced images exist.
// Run with: npm run db:seed
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import type { Database } from '../src/types/supabase';
import { slugify } from '../src/lib/slug';
import { categories, products } from './catalog';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.local'), quiet: true });

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local');
}

// service-role client: bypasses RLS, local-script use only, never bundled into the app
const supabase = createClient<Database>(supabaseUrl, secretKey, {
  // Node 20 has no native WebSocket; ws's shape doesn't line up with the DOM
  // WebSocket typings the client expects, but it's a Node-only compat shim.
  realtime: { transport: ws as never },
});

// Category slugs from the very first seed, renamed in place so ids are kept.
const renamedCategories: Record<string, string> = { shoe: 'shoes', handbag: 'accessories' };

async function seedCategories() {
  for (const [oldSlug, newSlug] of Object.entries(renamedCategories)) {
    const target = categories.find((c) => c.slug === newSlug);
    if (!target) continue;
    const { error } = await supabase
      .from('categories')
      .update({ slug: target.slug, name: target.name })
      .eq('slug', oldSlug);
    if (error) throw error;
  }

  const rows = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    sort_order: c.sortOrder,
    image_path: `/images/editorial/tile-${c.slug}.jpg`,
  }));
  const { error } = await supabase.from('categories').upsert(rows, { onConflict: 'slug' });
  if (error) throw error;

  const { data, error: readError } = await supabase.from('categories').select('id, slug');
  if (readError) throw readError;
  return new Map(data.map((c) => [c.slug, c.id]));
}

// The storefront lists products newest-first. Interleave categories (women, men,
// shoes, accessories, women, men, ...) and stamp created_at accordingly so the
// unfiltered "All" grid reads as a varied mix rather than four blocks.
function interleaveByCategory<T extends { category: string }>(items: T[]): T[] {
  const queues = categories.map((c) => items.filter((item) => item.category === c.slug));
  const result: T[] = [];
  while (queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      const next = queue.shift();
      if (next) result.push(next);
    }
  }
  return result;
}

async function seedProducts(categoryIdBySlug: Map<string, string>) {
  const now = Date.now();
  const rows: Database['public']['Tables']['products']['Insert'][] = interleaveByCategory(products).map((p, index) => {
    const slug = slugify(p.name);
    return {
      created_at: new Date(now - index * 1000).toISOString(),
      slug,
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category_id: categoryIdBySlug.get(p.category) ?? null,
      image_path: `/images/products/${slug}.jpg`,
      size: p.size,
      color: p.color,
      made_in: p.madeIn,
      is_featured: p.featured ?? false,
    };
  });

  const { error } = await supabase.from('products').upsert(rows, { onConflict: 'slug' });
  if (error) throw error;

  // Remove the original placeholder rows (slugs like "jamaican-regge-shoe-7").
  // Anything an admin created through the UI has no numeric suffix and is kept.
  const keep = new Set(rows.map((r) => r.slug));
  const { data: existing, error: readError } = await supabase.from('products').select('slug');
  if (readError) throw readError;
  const stale = existing.map((r) => r.slug).filter((slug) => !keep.has(slug) && /-\d+$/.test(slug));
  if (stale.length > 0) {
    const { error: deleteError } = await supabase.from('products').delete().in('slug', stale);
    if (deleteError) throw deleteError;
  }

  return { upserted: rows.length, removed: stale.length };
}

async function main() {
  const categoryIdBySlug = await seedCategories();
  const result = await seedProducts(categoryIdBySlug);
  console.log(`Seeded ${categories.length} categories and ${result.upserted} products; removed ${result.removed} placeholder rows.`);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
