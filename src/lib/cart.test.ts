import { describe, expect, it } from 'vitest';
import { computeCartTotal, mergeCartLine } from './cart';
import type { CartItem, Product } from '../types/domain';

function mockProduct(id: string, price: number): Product {
  return {
    id,
    slug: id,
    name: id,
    description: null,
    price,
    stock: 1,
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

describe('mergeCartLine', () => {
  it('adds a new line for a product not already in the cart', () => {
    const result = mergeCartLine([], 'p1', 1);
    expect(result).toEqual([{ productId: 'p1', quantity: 1 }]);
  });

  it('increments quantity instead of duplicating a line on repeat add', () => {
    // Regression test: the original Context.jsx's checkId() did
    // `carts.push(cartData)` unconditionally, so adding the same product
    // twice created two separate cart rows instead of quantity 2.
    const afterFirst = mergeCartLine([], 'p1', 1);
    const afterSecond = mergeCartLine(afterFirst, 'p1', 1);
    expect(afterSecond).toEqual([{ productId: 'p1', quantity: 2 }]);
  });

  it('leaves other lines untouched when merging one product', () => {
    const initial = [{ productId: 'p1', quantity: 1 }, { productId: 'p2', quantity: 5 }];
    const result = mergeCartLine(initial, 'p2', 2);
    expect(result).toEqual([{ productId: 'p1', quantity: 1 }, { productId: 'p2', quantity: 7 }]);
  });
});
