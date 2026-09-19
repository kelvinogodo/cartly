import type { CartItem, Product } from '../types/domain';

const GUEST_CART_KEY = 'cartly:guest-cart:v2';
const LEGACY_GUEST_CART_KEY = 'cartly:guest-cart';

export interface CartLine {
  productId: string;
  quantity: number;
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
  create?: (productId: string, quantity: number) => L
): L[] {
  const existing = lines.find((line) => line.productId === productId);
  if (existing) {
    return lines.map((line) =>
      line.productId === productId ? { ...line, quantity: line.quantity + quantityToAdd } : line
    );
  }
  const made = create ? create(productId, quantityToAdd) : ({ productId, quantity: quantityToAdd } as L);
  return [...lines, made];
}

/** Sets an exact quantity for a product: <= 0 removes it, a missing line is appended. */
export function applyQuantity(items: CartItem[], product: Product, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter((item) => item.productId !== product.id);
  const exists = items.some((item) => item.productId === product.id);
  if (exists) {
    return items.map((item) => (item.productId === product.id ? { ...item, quantity, product } : item));
  }
  return [...items, { productId: product.id, quantity, product }];
}

/** Largest quantity of `product` the shopper may hold, given what's already in the bag. */
export function remainingStock(product: Product, inBag: number): number {
  return Math.max(0, product.stock - inBag);
}

export type AddResult = 'added' | 'sold_out' | 'limit';

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
    line.product.id === line.productId
  );
}

export function readGuestCart(): GuestCartLine[] {
  try {
    localStorage.removeItem(LEGACY_GUEST_CART_KEY); // v1 stored ids only; can't be rendered instantly
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isGuestLine) : [];
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
