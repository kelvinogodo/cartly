// Single source of truth for the demo catalog. Consumed by both
// scripts/optimize-images.ts (builds normalized images) and scripts/seed.ts
// (writes rows), so names, images and categories can't drift apart.

export interface CatalogCategory {
  slug: string;
  name: string;
  sortOrder: number;
  // editorial photo used for the hero slide + category tile
  editorialSource: string;
}

export interface CatalogProduct {
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  color: string;
  size: string;
  madeIn: string;
  featured?: boolean;
  // brightness (0-255) of an inset grey studio backdrop to lift to pure white
  liftBackdrop?: number;
  // filename inside public/images (original, un-normalized asset)
  source: string;
}

const LETTER_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

/**
 * Turns the catalog's human size range into selectable options:
 * "S – XXL" -> S…XXL, "EU 40 – 45" -> 40…45, "36 – 48" -> 36, 38 … 48 (suit sizes go in 2s),
 * "One size" -> none (nothing to choose), anything else (e.g. "36 mm") -> that single value.
 */
export function expandSizes(range: string): string[] {
  const text = range.trim();
  if (/^one size$/i.test(text)) return [];
  const parts = text.replace(/^EU\s+/i, '').split(/\s*[–-]\s*/);
  if (parts.length === 2) {
    const [from, to] = parts as [string, string];
    const a = LETTER_SIZES.indexOf(from);
    const b = LETTER_SIZES.indexOf(to);
    if (a >= 0 && b >= a) return LETTER_SIZES.slice(a, b + 1);
    const lo = Number(from);
    const hi = Number(to);
    if (Number.isFinite(lo) && Number.isFinite(hi) && hi > lo) {
      const step = hi - lo > 8 ? 2 : 1;
      const out: string[] = [];
      for (let n = lo; n <= hi; n += step) out.push(String(n));
      return out;
    }
  }
  return [text];
}

export const categories: CatalogCategory[] = [
  { slug: 'women', name: 'Women', sortOrder: 1, editorialSource: 'pexels-ali-pazani-2681751.jpg' },
  { slug: 'men', name: 'Men', sortOrder: 2, editorialSource: 'pexels-lawrence-suzara-1566421.jpg' },
  { slug: 'shoes', name: 'Shoes', sortOrder: 3, editorialSource: 'pexels-lazaro-rodriguez-jr-6911546.jpg' },
  { slug: 'accessories', name: 'Accessories', sortOrder: 4, editorialSource: 'handbag (4).jpg' },
];

export const products: CatalogProduct[] = [
  // ---- Men ----
  {
    name: 'Forest Three-Piece Suit', category: 'men', price: 890, stock: 12, featured: true,
    color: 'Forest green', size: '36 – 48', madeIn: 'Italy', source: 'coperate-suit.jpg', liftBackdrop: 232,
    description: 'A three-piece suit in deep forest wool blend: notch-lapel jacket, waistcoat and flat-front trousers, cut close through the shoulder for a clean modern line.',
  },
  {
    name: 'Grey Windowpane Three-Piece Suit', category: 'men', price: 760, stock: 9,
    color: 'Grey', size: '36 – 48', madeIn: 'Portugal', source: 'oficial-suit (3).jpg',
    description: 'A soft grey windowpane check with a fitted waistcoat. Sharp enough for the boardroom, relaxed enough to wear the jacket on its own.',
  },
  {
    name: 'Navy Check Double-Breasted Suit', category: 'men', price: 820, stock: 7, featured: true,
    color: 'Navy check', size: '36 – 48', madeIn: 'Italy', source: 'oficial-suit (2).jpg',
    description: 'A double-breasted navy suit in a bold tonal check, with peak lapels and a strong, structured shoulder.',
  },
  {
    name: 'Sky Blue Three-Piece Suit', category: 'men', price: 680, stock: 10,
    color: 'Sky blue', size: '36 – 48', madeIn: 'Turkey', source: 'mens-suit.jpg',
    description: 'A light, airy three-piece in sky blue — made for summer weddings and long lunches.',
  },
  {
    name: 'Cobalt Single-Button Blazer', category: 'men', price: 420, stock: 14,
    color: 'Cobalt blue', size: '36 – 48', madeIn: 'Portugal', source: 'oficial-suit (5).jpg',
    description: 'A single-button blazer in a saturated cobalt. Slim through the body with a clean, unlined finish.',
  },
  {
    name: 'Burgundy Jacquard Dinner Jacket', category: 'men', price: 540, stock: 5,
    color: 'Burgundy', size: '36 – 48', madeIn: 'Italy', source: 'oficial-suit (4).jpg',
    description: 'A dinner jacket woven in a tonal floral jacquard, with a satin-faced notch lapel. Made to be noticed.',
  },
  {
    name: 'Black Three-Piece Tuxedo', category: 'men', price: 980, stock: 6,
    color: 'Black', size: '36 – 48', madeIn: 'Italy', source: 'wedding-suit (1).jpg',
    description: 'A classic black tuxedo with satin peak lapels, matching waistcoat and a trouser with a satin side stripe.',
  },
  {
    name: 'Midnight Shawl-Collar Tuxedo', category: 'men', price: 1050, stock: 4,
    color: 'Midnight navy', size: '36 – 48', madeIn: 'Italy', source: 'wedding-suit (6).jpg',
    description: 'Deep midnight navy with a black satin shawl collar. Formal without defaulting to black.',
  },
  {
    name: 'Camel Contrast-Lapel Tuxedo', category: 'men', price: 920, stock: 3,
    color: 'Camel', size: '36 – 48', madeIn: 'Portugal', source: 'preview (1).png',
    description: 'A warm camel jacket with contrasting black satin lapels and a matching waistcoat.',
  },
  {
    name: 'Colour-Block Resort Shirt', category: 'men', price: 95, stock: 40,
    color: 'Black / teal / mustard', size: 'S – XXL', madeIn: 'Portugal', source: 'shirt.png',
    description: 'A short-sleeve resort shirt with a vertical colour-block panel and a relaxed camp collar.',
  },
  {
    name: 'Colour-Block Polo', category: 'men', price: 85, stock: 35,
    color: 'Blue / white / navy', size: 'S – XXL', madeIn: 'Portugal', source: 'polo-removebg-preview.png',
    description: 'A polo in a sharp asymmetric colour-block, cut from a soft, breathable piqué.',
  },

  // ---- Women ----
  {
    name: 'Ivory Wool Jacket', category: 'women', price: 380, stock: 11, featured: true,
    color: 'Ivory', size: 'XS – L', madeIn: 'Italy', source: 'women-dress (3).jpg',
    description: 'A boxy, collarless jacket in a soft ivory wool blend. Layers over everything.',
  },
  {
    name: 'Burgundy Tweed Ensemble', category: 'women', price: 520, stock: 8, featured: true,
    color: 'Burgundy', size: 'XS – L', madeIn: 'United Kingdom', source: 'women-dress (4).jpg',
    description: 'A burgundy tweed jacket and skirt set with a gently structured shoulder and a rich, textured weave.',
  },
  {
    name: 'Navy & Ivory Blazer Set', category: 'women', price: 460, stock: 9,
    color: 'Navy / ivory', size: 'XS – L', madeIn: 'Portugal', source: 'women-dress (2).jpg',
    description: 'A double-breasted navy blazer with contrast piping, paired with a crisp ivory version — two ways to wear the same idea.',
  },
  {
    name: 'Polka Dot Day Dress', category: 'women', price: 210, stock: 16,
    color: 'Tan / brown', size: 'XS – L', madeIn: 'Portugal', source: 'women-dress (1).jpg',
    description: 'A sleeveless polka-dot dress with a tie belt and a fluid skirt, cut for warm days.',
  },

  // ---- Shoes ----
  {
    name: 'Black Leather Oxford', category: 'shoes', price: 265, stock: 18, featured: true,
    color: 'Black', size: 'EU 40 – 45', madeIn: 'Portugal', source: 'black_shoe1__1_-removebg-preview.png',
    description: 'A polished black leather oxford with a slim toe and a leather sole — the shoe every suit here was made for.',
  },
  {
    name: 'Indigo Canvas Sneaker', category: 'shoes', price: 110, stock: 24,
    color: 'Indigo', size: 'EU 40 – 45', madeIn: 'Vietnam', source: 'sneaker.png',
    description: 'A low-profile canvas sneaker on a white vulcanised sole. Easy, light, and gets better with wear.',
  },
  {
    name: 'Cyan Suede Sneaker', category: 'shoes', price: 125, stock: 0,
    color: 'Cyan', size: 'EU 40 – 45', madeIn: 'Vietnam', source: 'sneaker2.png',
    description: 'A brushed-suede sneaker in a vivid cyan, with matching laces and a clean white sole.',
  },
  {
    name: 'Electric Blue Runner', category: 'shoes', price: 150, stock: 20, featured: true,
    color: 'Electric blue', size: 'EU 40 – 45', madeIn: 'Vietnam', source: 'istockphoto-1249496770-170667a-removebg-preview.png',
    description: 'A lightweight mesh running shoe with a cushioned midsole and a knit upper that stays out of the way.',
  },
  {
    name: 'Trail Hiking Boot', category: 'shoes', price: 190, stock: 13,
    color: 'Blue / orange', size: 'EU 40 – 46', madeIn: 'Vietnam', source: 'can.png',
    description: 'A grippy trail boot with an aggressive lugged sole and a reinforced toe cap for rough ground.',
  },
  {
    name: 'Blush Quilted Slide', category: 'shoes', price: 75, stock: 22,
    color: 'Blush pink', size: 'EU 36 – 41', madeIn: 'Portugal', source: 'pams-removebg-preview.png',
    description: 'A satin-quilted slide with a cushioned footbed — the easiest thing to reach for.',
  },

  // ---- Accessories ----
  {
    name: 'Rose Gold Star-Dial Watch', category: 'accessories', price: 340, stock: 15, featured: true,
    color: 'Rose gold', size: '36 mm', madeIn: 'Switzerland', source: 'watch-removebg-preview.png',
    description: 'A rose-gold bracelet watch with a deep-blue star-scattered dial and a slim, polished case.',
  },
  {
    name: 'Sky Blue Top-Handle Bag', category: 'accessories', price: 245, stock: 10, featured: true,
    color: 'Sky blue', size: 'One size', madeIn: 'Italy', source: 'beautiful-handbag.png',
    description: 'A structured top-handle bag in soft sky-blue leather, finished with a removable charm and a detachable strap.',
  },
  {
    name: 'Cognac Leather Hobo', category: 'accessories', price: 310, stock: 7,
    color: 'Cognac', size: 'One size', madeIn: 'Italy', source: 'f0682bf0b5f8616f76091663271e4b9b-removebg-preview.png',
    description: 'A slouchy hobo in supple cognac leather with rolled handles — it softens and darkens with use.',
  },
];

export const editorial = {
  auth: { source: 'pexels-ali-pazani-2584269.jpg', file: 'auth.jpg', width: 1100, height: 1500 },
  story: { source: 'pexels-tobi-631986.jpg', file: 'story.jpg', width: 1600, height: 1200 },
};
