/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { absoluteUrl, escapeHtml, renderProductPage, summarize, type ProductMeta } from '../../api/product-meta';
import { buildSitemap } from '../../api/sitemap';

// Mirrors the head of index.html.
const TEMPLATE = `<html><head>
    <title>Cartly</title>
    <!-- seo:start -->
    <meta name="description" content="default" />
    <!-- seo:end -->
  </head><body><div id="root"></div></body></html>`;

const product: ProductMeta = {
  name: 'Forest "Three-Piece" Suit',
  slug: 'forest-three-piece-suit',
  description: 'A three-piece suit in deep forest wool blend.',
  price: 890,
  stock: 12,
  image_path: '/images/products/forest-three-piece-suit.jpg',
};

describe('renderProductPage', () => {
  const html = renderProductPage(TEMPLATE, product, 'https://shop.example');

  it('sets a product-specific title and swaps out the default description', () => {
    expect(html).toContain('<title>Forest &quot;Three-Piece&quot; Suit — Cartly</title>');
    expect(html).not.toContain('content="default"');
    expect(html).toContain('<meta name="description" content="A three-piece suit in deep forest wool blend." />');
  });

  it('emits absolute Open Graph and canonical URLs on the request origin', () => {
    expect(html).toContain('og:image" content="https://shop.example/images/products/forest-three-piece-suit.jpg"');
    expect(html).toContain('og:url" content="https://shop.example/products/forest-three-piece-suit"');
    expect(html).toContain('rel="canonical" href="https://shop.example/products/forest-three-piece-suit"');
  });

  it('includes schema.org Product data with price and availability', () => {
    const ld = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)?.[1];
    const data = JSON.parse(ld ?? '{}');
    expect(data['@type']).toBe('Product');
    expect(data.offers.price).toBe('890.00');
    expect(data.offers.availability).toBe('https://schema.org/InStock');
  });

  it('reports sold-out products as out of stock', () => {
    const out = renderProductPage(TEMPLATE, { ...product, stock: 0 }, 'https://shop.example');
    expect(out).toContain('https://schema.org/OutOfStock');
  });

  it('cannot be broken out of by hostile product names', () => {
    const evil = renderProductPage(TEMPLATE, { ...product, name: '</script><script>alert(1)</script>' }, 'https://x.test');
    expect(evil).not.toContain('<script>alert(1)</script>');
    expect(evil).not.toMatch(/<title>[^<]*<\/script>/);
  });
});

describe('helpers', () => {
  it('escapes HTML metacharacters', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;');
  });

  it('summarises long text at a word boundary and falls back when empty', () => {
    const long = 'word '.repeat(80);
    const out = summarize(long, 'fallback');
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith('…')).toBe(true);
    expect(summarize('   ', 'fallback')).toBe('fallback');
    expect(summarize(null, 'fallback')).toBe('fallback');
  });

  it('leaves absolute URLs alone and prefixes relative ones', () => {
    expect(absoluteUrl('https://a.test', 'https://cdn.test/x.jpg')).toBe('https://cdn.test/x.jpg');
    expect(absoluteUrl('https://a.test', '/images/x.jpg')).toBe('https://a.test/images/x.jpg');
  });
});

describe('buildSitemap', () => {
  it('lists static pages and every product with a lastmod date', () => {
    const xml = buildSitemap('https://shop.example', [{ slug: 'a-b', updated_at: '2026-09-01T10:00:00Z' }]);
    expect(xml).toContain('<loc>https://shop.example/</loc>');
    expect(xml).toContain('<loc>https://shop.example/privacy</loc>');
    expect(xml).toContain('<loc>https://shop.example/products/a-b</loc><lastmod>2026-09-01</lastmod>');
  });
});
