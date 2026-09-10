import type { CartItem } from '../types/domain';

const GUEST_CART_STORAGE_KEY = 'cartly:guest-cart';

export interface CartLine {
  productId: string;
  quantity: number;
}

export function computeCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

export function mergeCartLine(lines: CartLine[], productId: string, quantityToAdd: number): CartLine[] {
  const existing = lines.find((line) => line.productId === productId);
  if (existing) {
    return lines.map((line) =>
      line.productId === productId ? { ...line, quantity: line.quantity + quantityToAdd } : line
    );
  }
  return [...lines, { productId, quantity: quantityToAdd }];
}

export function readGuestCartLines(): CartLine[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeGuestCartLines(lines: CartLine[]): void {
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // private browsing / storage disabled — guest cart just won't persist
  }
}

export function clearGuestCartLines(): void {
  try {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  } catch {
    // ignore
  }
}
