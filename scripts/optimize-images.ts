// Builds the web-ready images the storefront actually serves:
//   public/images/products/<slug>.jpg     800x1000 (4:5), product trimmed + centred on white
//   public/images/editorial/*.jpg         hero / category-tile / auth / story photography
// Source assets in public/images stay untouched. Run: npm run images:build
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { categories, editorial, products } from './catalog';
import { slugify } from '../src/lib/slug';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.resolve(__dirname, '../public/images');
const productsDir = path.join(imagesDir, 'products');
const editorialDir = path.join(imagesDir, 'editorial');
mkdirSync(productsDir, { recursive: true });
mkdirSync(editorialDir, { recursive: true });

const CANVAS_W = 800;
const CANVAS_H = 1000;

async function normalizeProduct(sourceFile: string, outFile: string, liftBackdrop?: number) {
  // 1. flatten transparency onto white
  const flat = await sharp(path.join(imagesDir, sourceFile)).rotate().flatten({ background: '#ffffff' }).toBuffer();

  // 2. some studio shots sit on a faint grey/cream backdrop rather than pure
  //    white. Sample the corner and lift that backdrop to white so every card
  //    reads as the same seamless white. `liftBackdrop` overrides the sampled
  //    value for shots where the backdrop is inset inside a white border.
  const corner = await sharp(flat).extract({ left: 2, top: 2, width: 8, height: 8 }).stats();
  const sampled = Math.min(...corner.channels.slice(0, 3).map((c) => c.mean));
  const backdrop = liftBackdrop ?? sampled;
  const lifted = backdrop >= 205 && backdrop < 253 ? await sharp(flat).linear(255 / backdrop, 0).toBuffer() : flat;

  // 3. trim the now-uniform white margins
  const trimmed = await sharp(lifted).trim({ background: '#ffffff', threshold: 14 }).toBuffer();
  const meta = await sharp(trimmed).metadata();

  // wide products (shoes, flat-lays) get a slightly wider box than tall ones (suits)
  const wide = (meta.width ?? 1) / (meta.height ?? 1) > 1.15;
  const boxW = wide ? 720 : 660;
  const boxH = wide ? 700 : 860;

  const resized = await sharp(trimmed)
    .resize(boxW, boxH, { fit: 'inside', kernel: 'lanczos3' })
    .toBuffer({ resolveWithObject: true });

  await sharp({ create: { width: CANVAS_W, height: CANVAS_H, channels: 3, background: '#ffffff' } })
    .composite([
      {
        input: resized.data,
        left: Math.round((CANVAS_W - resized.info.width) / 2),
        top: Math.round((CANVAS_H - resized.info.height) / 2),
      },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(outFile);
}

async function cover(sourceFile: string, outFile: string, width: number, height: number) {
  await sharp(path.join(imagesDir, sourceFile))
    .rotate()
    .resize(width, height, { fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: 78, mozjpeg: true, progressive: true })
    .toFile(outFile);
}

async function main() {
  for (const product of products) {
    const slug = slugify(product.name);
    await normalizeProduct(product.source, path.join(productsDir, `${slug}.jpg`), product.liftBackdrop);
    console.log('product ', slug);
  }
  for (const category of categories) {
    await cover(category.editorialSource, path.join(editorialDir, `hero-${category.slug}.jpg`), 1300, 1400);
    await cover(category.editorialSource, path.join(editorialDir, `tile-${category.slug}.jpg`), 720, 900);
    console.log('category', category.slug);
  }
  for (const item of Object.values(editorial)) {
    await cover(item.source, path.join(editorialDir, item.file), item.width, item.height);
    console.log('editorial', item.file);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
