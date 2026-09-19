import { describe, expect, it } from 'vitest';
import {
  applyQuantity, cartCount, computeCartTotal, describeSelection, lineKey, mergeCartLine, planAdd, resolveSelection, unitsOfProduct,
} from './cart';
import type { CartItem, Product } from '../types/domain';

const NONE = { size: '', color: '' };

function mockProduct(id: string, price: number, stock = 10, extra: Partial<Product> = {}): Product {
  return {
    id,
    slug: id,
    name: id,
    description: null,
    price,
    stock,
    category_id: null,
    image_path: '/images/x.png',
    sizes: [],
    colors: [],
    made_in: null,
    is_featured: false,
    created_at: '',
    updated_at: '',
    ...extra,
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
      { productId: 'p1', quantity: 2, product: mockProduct('p1', 100), ...NONE },
      { productId: 'p2', quantity: 3, product: mockProduct('p2', 50), ...NONE },
    ];
    expect(computeCartTotal(items)).toBe(350);
  });
});

describe('cartCount', () => {
  it('counts total units, not distinct lines', () => {
    expect(cartCount([{ productId: 'a', quantity: 2, ...NONE }, { productId: 'b', quantity: 3, ...NONE }])).toBe(5);
  });

  it('is 0 for an empty bag', () => {
    expect(cartCount([])).toBe(0);
  });
});

describe('mergeCartLine', () => {
  it('adds a new line for a product not already in the cart', () => {
    expect(mergeCartLine([], 'p1', 1)).toEqual([{ productId: 'p1', quantity: 1, ...NONE }]);
  });

  it('increments quantity instead of duplicating a line on repeat add', () => {
    // Regression test: the original Context.jsx's checkId() did
    // `carts.push(cartData)` unconditionally, so adding the same product
    // twice created two separate cart rows instead of quantity 2.
    const afterFirst = mergeCartLine([], 'p1', 1);
    expect(mergeCartLine(afterFirst, 'p1', 1)).toEqual([{ productId: 'p1', quantity: 2, ...NONE }]);
  });

  it('leaves other lines untouched when merging one product', () => {
    const initial = [{ productId: 'p1', quantity: 1, ...NONE }, { productId: 'p2', quantity: 5, ...NONE }];
    expect(mergeCartLine(initial, 'p2', 2)).toEqual([
      { productId: 'p1', quantity: 1, ...NONE },
      { productId: 'p2', quantity: 7, ...NONE },
    ]);
  });

  it('keeps the same product in a different size as its own line', () => {
    const m = { size: 'M', color: '' };
    const l = { size: 'L', color: '' };
    let lines = mergeCartLine([], 'p1', 1, m);
    lines = mergeCartLine(lines, 'p1', 1, l);
    lines = mergeCartLine(lines, 'p1', 2, m);
    expect(lines).toEqual([
      { productId: 'p1', quantity: 3, ...m },
      { productId: 'p1', quantity: 1, ...l },
    ]);
  });
});

describe('applyQuantity', () => {
  const product = mockProduct('p1', 10);

  it('appends a line that is not in the bag yet', () => {
    expect(applyQuantity([], product, NONE, 2)).toEqual([{ productId: 'p1', quantity: 2, product, ...NONE }]);
  });

  it('sets an exact quantity on an existing line', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1, product, ...NONE }];
    expect(applyQuantity(items, product, NONE, 4)[0]?.quantity).toBe(4);
  });

  it('removes the line when quantity drops to zero', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1, product, ...NONE }];
    expect(applyQuantity(items, product, NONE, 0)).toEqual([]);
  });

  it('only touches the line for the chosen size', () => {
    const m = { size: 'M', color: '' };
    const l = { size: 'L', color: '' };
    const items: CartItem[] = [
      { productId: 'p1', quantity: 1, product, ...m },
      { productId: 'p1', quantity: 2, product, ...l },
    ];
    const next = applyQuantity(items, product, m, 0);
    expect(next).toHaveLength(1);
    expect(next[0]?.size).toBe('L');
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

describe('options', () => {
  const shirt = mockProduct('shirt', 40, 10, { sizes: ['S', 'M', 'L'], colors: ['Navy'] });

  it('builds distinct keys per size and colour', () => {
    expect(lineKey({ productId: 'p', size: 'M', color: '' })).not.toBe(lineKey({ productId: 'p', size: 'L', color: '' }));
  });

  it('shares stock across sizes when counting units of a product', () => {
    const items = [
      { productId: 'p1', quantity: 2 },
      { productId: 'p1', quantity: 3 },
      { productId: 'p2', quantity: 9 },
    ];
    expect(unitsOfProduct(items, 'p1')).toBe(5);
  });

  it('asks for a size when there are several and none is chosen', () => {
    expect(resolveSelection(shirt, {}).missing).toBe('size');
  });

  it('accepts a valid size and implies a single colour', () => {
    expect(resolveSelection(shirt, { size: 'M' })).toEqual({ selection: { size: 'M', color: 'Navy' }, missing: null });
  });

  it('rejects a size the product does not come in', () => {
    expect(resolveSelection(shirt, { size: 'XXL' }).missing).toBe('size');
  });

  it('needs no choice for a product without options', () => {
    expect(resolveSelection(mockProduct('bag', 10), {})).toEqual({ selection: NONE, missing: null });
  });

  it('describes a selection for display', () => {
    expect(describeSelection({ size: 'M', color: 'Navy' })).toBe('Navy · Size M');
    expect(describeSelection(NONE)).toBe('');
  });
});
