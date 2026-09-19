// /sitemap.xml — the storefront's public pages plus one entry per product.
// Self-contained on purpose; see the note in product-meta.ts.
import type { IncomingMessage, ServerResponse } from 'node:http';

const STATIC_PATHS = ['/', '/shipping', '/returns', '/privacy', '/terms'];

function xmlEscape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildSitemap(origin: string, products: { slug: string; updated_at: string }[]): string {
  const urls = [
    ...STATIC_PATHS.map((path) => `  <url><loc>${xmlEscape(origin + path)}</loc></url>`),
    ...products.map(
      (p) =>
        `  <url><loc>${xmlEscape(`${origin}/products/${p.slug}`)}</loc><lastmod>${p.updated_at.slice(0, 10)}</lastmod></url>`
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const host = (req.headers['x-forwarded-host'] as string | undefined) ?? req.headers.host ?? '';
  const origin = `https://${host}`;
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  let products: { slug: string; updated_at: string }[] = [];
  if (base && key) {
    try {
      const response = await fetch(`${base}/rest/v1/products?select=slug,updated_at&order=created_at.desc&limit=1000`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
      });
      if (response.ok) products = (await response.json()) as typeof products;
    } catch {
      // serve the static pages even if the catalog lookup fails
    }
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.end(buildSitemap(origin, products));
}
