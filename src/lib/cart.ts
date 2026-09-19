import type { CartItem, OptionSelection, Product } from '../types/domain';

const GUEST_CART_KEY = 'cartly:guest-cart:v2';
const LEGACY_GUEST_CART_KEY = 'cartly:guest-cart';

export interface CartLine extends OptionSelection {
  productId: string;
  quantity: number;
}

export const NO_OPTIONS: OptionSelection = { size: '', color: '' };

/** Identity of a bag line: the same product in another size is a different line. */
export function lineKey(line: { productId: string; size: string; color: string }): string {
  return `${line.productId}|${line.size}|${line.color}`;
}

export function sameLine(a: { productId: string; size: string; color: string }, b: { productId: string; size: string; color: string }): boolean {
  return a.productId === b.productId && a.size === b.size && a.color === b.color;
}

/** Units of one product across all of its sizes/colours — they share one stock pool. */
export function unitsOfProduct(items: { productId: string; quantity: number }[], productId: string): number {
  return items.reduce((sum, item) => (item.productId === productId ? sum + item.quantity : sum), 0);
}

/**
 * Which option (if any) is still missing before `product` can be added.
 * A product with a single size/colour needs no choice — it is implied.
 */
export function resolveSelection(product: Product, chosen: Partial<OptionSelection>): { selection: OptionSelection; missing: 'size' | 'color' | null } {
  const pick = (options: string[], value: string | undefined): string =>
    options.length === 0 ? '' : options.length === 1 ? (options[0] as string) : options.includes(value ?? '') ? (value as string) : '';
  const selection = { size: pick(product.sizes, chosen.size), color: pick(product.colors, chosen.color) };
  const missing = product.sizes.length > 0 && !selection.size ? 'size' : product.colors.length > 0 && !selection.color ? 'color' : null;
  return { selection, missing };
}

/** Human label for a line's option, e.g. "Navy · Size M". */
export function describeSelection(sel: OptionSelection): string {
  return [sel.color, sel.size && `Size ${sel.size}`].filter(Boolean).join(' · ');
}

// Guest carts store a snapshot of the product alongside the quantity so the
// UI can render instantly (no waiting on a network round-trip to learn a
// line's name/price/image the moment it's added).
export interface GuestCartLine extends CartLine {
  product: Product;
}

export function computeCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

// Total units in the bag (what the header badge shows), not distinct lines.
export function cartCount(items: CartLine[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function mergeCartLine<L extends CartLine>(
  lines: L[],
  productId: string,
  quantityToAdd: number,
  selection: OptionSelection = NO_OPTIONS,
  create?: (productId: string, quantity: number, selection: OptionSelection) => L
): L[] {
  const target = { productId, ...selection };
  const existing = lines.find((line) => sameLine(line, target));
  if (existing) {
    return lines.map((line) => (sameLine(line, target) ? { ...line, quantity: line.quantity + quantityToAdd } : line));
  }
  const made = create ? create(productId, quantityToAdd, selection) : ({ productId, quantity: quantityToAdd, ...selection } as L);
  return [...lines, made];
}

/** Sets an exact quantity for a product line: <= 0 removes it, a missing line is appended. */
export function applyQuantity(items: CartItem[], product: Product, selection: OptionSelection, quantity: number): CartItem[] {
  const target = { productId: product.id, ...selection };
  if (quantity <= 0) return items.filter((item) => !sameLine(item, target));
  const exists = items.some((item) => sameLine(item, target));
  if (exists) {
    return items.map((item) => (sameLine(item, target) ? { ...item, quantity, product } : item));
  }
  return [...items, { productId: product.id, quantity, product, ...selection }];
}

/** Largest quantity of `product` the shopper may hold, given what's already in the bag. */
export function remainingStock(product: Product, inBag: number): number {
  return Math.max(0, product.stock - inBag);
}

export type AddResult = 'added' | 'sold_out' | 'limit' | 'needs_option';

/** Decide what adding `quantity` more of `product` would do, without side effects. */
export function planAdd(product: Product, inBag: number, quantity = 1): { result: AddResult; nextQuantity: number } {
  if (product.stock <= 0) return { result: 'sold_out', nextQuantity: inBag };
  if (inBag >= product.stock) return { result: 'limit', nextQuantity: inBag };
  return { result: 'added', nextQuantity: Math.min(inBag + quantity, product.stock) };
}

function isGuestLine(value: unknown): value is GuestCartLine {
  if (!value || typeof value !== 'object') return false;
  const line = value as Partial<GuestCartLine>;
  return (
    typeof line.productId === 'string' &&
    typeof line.quantity === 'number' &&
    line.quantity > 0 &&
    !!line.product &&
    typeof line.product === 'object' &&
    line.product.id === line.productId &&
    (line.size === undefined || typeof line.size === 'string') &&
    (line.color === undefined || typeof line.color === 'string')
  );
}

export function readGuestCart(): GuestCartLine[] {
  try {
    localStorage.removeItem(LEGACY_GUEST_CART_KEY); // v1 stored ids only; can't be rendered instantly
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // lines saved before options existed have no size/colour
    return Array.isArray(parsed)
      ? parsed.filter(isGuestLine).map((line) => ({ ...line, size: line.size ?? '', color: line.color ?? '' }))
      : [];
  } catch {
    return [];
  }
}

export function writeGuestCart(lines: GuestCartLine[]): void {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
  } catch {
    // private browsing / storage disabled — guest cart just won't persist
  }
}

export function clearGuestCart(): void {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // ignore
  }
}

export const GUEST_CART_STORAGE_KEY = GUEST_CART_KEY;
