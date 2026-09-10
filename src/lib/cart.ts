import type { CartItem } from '../types/domain';

export function computeCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}
