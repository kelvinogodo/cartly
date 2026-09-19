import { describe, expect, it } from 'vitest';
import { applyQuantity, cartCount, computeCartTotal, mergeCartLine, planAdd } from './cart';
import type { CartItem, Product } from '../types/domain';

function mockProduct(id: string, price: number, stock = 10): Product {
  return {
    id,
    slug: id,
    name: id,
    description: null,
    price,
    stock,
    category_id: null,
    image_path: '/images/x.png',
    size: null,
    color: null,
    made_in: null,
    is_featured: false,
    created_at: '',
    updated_at: '',
  };
}

describe('computeCartTotal', () => {
  it('returns 0 for an empty cart instead of throwing', () => {
    // Regression test: the original Context.jsx did
    // `itemPrizes.reduce((total, num) => total + num)` with no seed value,
    // which throws a TypeError on an empty array.
    expect(computeCartTotal([])).toBe(0);
  });

  it('sums price * quantity across items', () => {
    const items: CartItem[] = [
      { productId: 'p1', quantity: 2, product: mockProduct('p1', 100) },
      { productId: 'p2', quantity: 3, product: mockProduct('p2', 50) },
    ];
    expect(computeCartTotal(items)).toBe(350);
  });
});

describe('cartCount', () => {
  it('counts total units, not distinct lines', () => {
    expect(cartCount([{ productId: 'a', quantity: 2 }, { productId: 'b', quantity: 3 }])).toBe(5);
  });

  it('is 0 for an empty bag', () => {
    expect(cartCount([])).toBe(0);
  });
});

describe('mergeCartLine', () => {
  it('adds a new line for a product not already in the cart', () => {
    expect(mergeCartLine([], 'p1', 1)).toEqual([{ productId: 'p1', quantity: 1 }]);
  });

  it('increments quantity instead of duplicating a line on repeat add', () => {
    // Regression test: the original Context.jsx's checkId() did
    // `carts.push(cartData)` unconditionally, so adding the same product
    // twice created two separate cart rows instead of quantity 2.
    const afterFirst = mergeCartLine([], 'p1', 1);
    expect(mergeCartLine(afterFirst, 'p1', 1)).toEqual([{ productId: 'p1', quantity: 2 }]);
  });

  it('leaves other lines untouched when merging one product', () => {
    const initial = [{ productId: 'p1', quantity: 1 }, { productId: 'p2', quantity: 5 }];
    expect(mergeCartLine(initial, 'p2', 2)).toEqual([{ productId: 'p1', quantity: 1 }, { productId: 'p2', quantity: 7 }]);
  });
});

describe('applyQuantity', () => {
  const product = mockProduct('p1', 10);

  it('appends a line that is not in the bag yet', () => {
    expect(applyQuantity([], product, 2)).toEqual([{ productId: 'p1', quantity: 2, product }]);
  });

  it('sets an exact quantity on an existing line', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1, product }];
    expect(applyQuantity(items, product, 4)[0]?.quantity).toBe(4);
  });

  it('removes the line when quantity drops to zero', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1, product }];
    expect(applyQuantity(items, product, 0)).toEqual([]);
  });
});

describe('planAdd', () => {
  it('adds when stock allows', () => {
    expect(planAdd(mockProduct('p', 1, 5), 2, 1)).toEqual({ result: 'added', nextQuantity: 3 });
  });

  it('refuses a sold-out product', () => {
    expect(planAdd(mockProduct('p', 1, 0), 0).result).toBe('sold_out');
  });

  it('refuses to exceed available stock', () => {
    expect(planAdd(mockProduct('p', 1, 3), 3).result).toBe('limit');
  });

  it('caps a large add at the remaining stock', () => {
    expect(planAdd(mockProduct('p', 1, 4), 3, 5)).toEqual({ result: 'added', nextQuantity: 4 });
  });
});
