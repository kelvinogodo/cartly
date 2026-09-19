// Serves the SPA's index.html for /products/:slug with product-specific <head>
// tags. Link-preview bots (Slack, WhatsApp, X, Facebook, iMessage) and many
// crawlers don't execute JavaScript, so tags set from React would never reach
// them. Real browsers get the same HTML and boot the app as normal.
//
// Deliberately self-contained (no relative imports): the package is ESM, where
// extensionless relative imports don't resolve in Vercel's Node runtime.
import type { IncomingMessage, ServerResponse } from 'node:http';

export interface ProductMeta {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_path: string;
}

const SEO_BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;
const TITLE_TAG = /<title>[\s\S]*?<\/title>/;

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Trims a description to a snippet-friendly length without cutting a word in half. */
export function summarize(text: string | null, fallback: string, max = 160): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return fallback;
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

export function absoluteUrl(origin: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Replaces the default head tags in index.html with ones describing `product`. */
export function renderProductPage(template: string, product: ProductMeta, origin: string): string {
  const title = `${product.name} — Cartly`;
  const description = summarize(product.description, `${product.name} at Cartly.`);
  const url = `${origin}/products/${product.slug}`;
  const image = absoluteUrl(origin, product.image_path);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    image: [image],
    url,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: Number(product.price).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };

  const tags = [
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta property="og:type" content="product" />`,
    `<meta property="og:site_name" content="Cartly" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="product:price:amount" content="${Number(product.price).toFixed(2)}" />`,
    `<meta property="product:price:currency" content="USD" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    // "<" is escaped so a product name can never close the script tag
    `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');

  return template
    .replace(TITLE_TAG, () => `<title>${escapeHtml(title)}</title>`)
    .replace(SEO_BLOCK, () => `<!-- seo:start -->\n    ${tags}\n    <!-- seo:end -->`);
}

async function fetchProduct(slug: string): Promise<ProductMeta | null> {
  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) return null;
  const response = await fetch(
    `${base}/rest/v1/products?slug=eq.${encodeURIComponent(slug)}&select=name,slug,description,price,stock,image_path&limit=1`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  if (!response.ok) return null;
  const rows = (await response.json()) as ProductMeta[];
  return rows[0] ?? null;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const slug = new URL(req.url ?? '/', 'http://localhost').searchParams.get('slug') ?? '';
  const host = (req.headers['x-forwarded-host'] as string | undefined) ?? req.headers.host ?? '';
  const origin = `https://${host}`;

  let template: string;
  try {
    const page = await fetch(`${origin}/index.html`);
    if (!page.ok) throw new Error(`index.html responded ${page.status}`);
    template = await page.text();
  } catch {
    res.statusCode = 502;
    res.end('Temporarily unavailable');
    return;
  }

  let html = template;
  // Unknown slugs and lookup failures still get the plain app shell, which shows its own 404.
  if (/^[a-z0-9-]{1,120}$/.test(slug)) {
    try {
      const product = await fetchProduct(slug);
      if (product) html = renderProductPage(template, product, origin);
    } catch {
      // fall through to the default shell
    }
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
  res.end(html);
}
