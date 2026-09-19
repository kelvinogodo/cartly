import { describe, expect, it, vi } from 'vitest';

vi.mock('./supabaseClient', () => ({ supabase: {} }));

import { storagePathFromUrl } from './storage';

describe('storagePathFromUrl', () => {
  it('extracts the object path from a Supabase public URL', () => {
    expect(
      storagePathFromUrl('https://abc.supabase.co/storage/v1/object/public/product-images/1234.jpg'),
    ).toBe('1234.jpg');
    expect(
      storagePathFromUrl('https://abc.supabase.co/storage/v1/object/public/product-images/a%20b.jpg?t=1'),
    ).toBe('a b.jpg');
  });

  it('ignores bundled seed images and external URLs so they are never deleted', () => {
    expect(storagePathFromUrl('/images/products/forest-suit.jpg')).toBeNull();
    expect(storagePathFromUrl('https://example.com/pic.jpg')).toBeNull();
    expect(storagePathFromUrl('https://abc.supabase.co/storage/v1/object/public/other-bucket/x.jpg')).toBeNull();
  });
});
