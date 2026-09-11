// One-off seed script — NOT imported by the app. Loads the 20 demo products
// that used to be hardcoded in src/Context.jsx into the real `products` table.
// Run with: npx tsx scripts/seed.ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { slugify } from '../src/lib/slug';
import type { Database } from '../src/types/supabase';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env.local') });

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

// The literal array formerly in src/Context.jsx (`prize`/`finalPrize`/`liked`
// dropped — `finalPrize` never meaningfully diverged from `prize` in the old
// UI, and `liked`/stock are now user- and admin-owned state respectively).
const legacyItems = [
  { id: 1, image: 'watch-removebg-preview.png', name: '45 caret-gold rolex watch', prize: 870, category: 'men', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 2, image: 'oficial-suit (3).jpg', name: 'italian suit', prize: 550, category: 'men', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 3, image: 'shirt.png', name: 'vintage t-shirt', prize: 150, category: 'men', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 4, image: 'casual-shoes (2).jpg', name: 'sneakers', prize: 200, category: 'shoe', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 5, image: 'oficial-suit (3).jpg', name: 'blue sneakers', prize: 3200, category: 'men', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 6, image: 'handbag (1).jpg', name: 'co-operate shoe', prize: 269, category: 'handbag', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 7, image: 'coperate-suit.jpg', name: 'jamaican regge shoe', prize: 436, category: 'men', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 8, image: 'sneaker3.png', name: 'jamaican regge shoe', prize: 609, category: 'shoe', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 9, image: 'women-dress (4).jpg', name: 'jamaican regge shoe', prize: 234, category: 'women', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 10, image: 'mens-suit.jpg', name: 'jamaican regge shoe', prize: 3700, category: 'men', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 11, image: 'beautiful-handbag.png', name: 'jamaican regge shoe', prize: 2000, category: 'handbag', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 12, image: 'women-dress (1).jpg', name: 'jamaican regge shoe', prize: 2008, category: 'women', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 13, image: 'women-dress (2).jpg', name: 'jamaican regge shoe', prize: 2077, category: 'women', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 14, image: 'women-dress (4).jpg', name: 'jamaican regge shoe', prize: 4300, category: 'women', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 15, image: 'pexels-lazaro-rodriguez-jr-6911546.jpg', name: 'jamaican regge shoe', prize: 1290, category: 'shoe', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 16, image: 'can.png', name: 'jamaican regge shoe', prize: 2098, category: 'shoe', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 17, image: 'casual-shoes (1).jpg', name: 'jamaican regge shoe', prize: 9700, category: 'shoe', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 18, image: 'sneaker2.png', name: 'jamaican regge shoe', prize: 9070, category: 'shoe', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 19, image: 'women-dress (6).jpg', name: 'jamaican regge shoe', prize: 9820, category: 'women', size: '63', color: 'black', madeIn: 'tanzania' },
  { id: 20, image: 'women-dress (3).jpg', name: 'jamaican regge shoe', prize: 2709, category: 'women', size: '63', color: 'black', madeIn: 'tanzania' },
];

// A handful marked featured so `is_featured`-driven "popular" sections have content.
const featuredIds = new Set([1, 2, 6, 9, 11, 16]);

async function main() {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, slug');
  if (categoriesError) throw categoriesError;

  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  const rows: Database['public']['Tables']['products']['Insert'][] = legacyItems.map((item) => ({
    slug: `${slugify(item.name)}-${item.id}`,
    name: item.name,
    price: item.prize,
    stock: 25,
    category_id: categoryIdBySlug.get(item.category) ?? null,
    image_path: `/images/${item.image}`,
    size: item.size,
    color: item.color,
    made_in: item.madeIn,
    is_featured: featuredIds.has(item.id),
  }));

  const { error: insertError, count } = await supabase
    .from('products')
    .upsert(rows, { onConflict: 'slug', count: 'exact' });
  if (insertError) throw insertError;

  console.log(`Seeded ${count ?? rows.length} products.`);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
