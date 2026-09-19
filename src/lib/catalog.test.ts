import { describe, expect, it } from 'vitest';
import { escapeLike, pageCount, pageRange, parsePrice } from './catalog';

describe('catalog helpers', () => {
  it('escapes LIKE wildcards so they match literally', () => {
    expect(escapeLike('50%_off')).toBe('50\\%\\_off');
    expect(escapeLike('plain')).toBe('plain');
  });

  it('parses price bounds, treating blanks and junk as no bound', () => {
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('  ')).toBeNull();
    expect(parsePrice('abc')).toBeNull();
    expect(parsePrice('-5')).toBeNull();
    expect(parsePrice('0')).toBe(0);
    expect(parsePrice('120.5')).toBe(120.5);
  });

  it('computes inclusive page ranges', () => {
    expect(pageRange(0, 12)).toEqual([0, 11]);
    expect(pageRange(2, 12)).toEqual([24, 35]);
    expect(pageRange(-1, 12)).toEqual([0, 11]);
  });

  it('always reports at least one page', () => {
    expect(pageCount(0, 12)).toBe(1);
    expect(pageCount(12, 12)).toBe(1);
    expect(pageCount(13, 12)).toBe(2);
    expect(pageCount(24, 12)).toBe(2);
  });
});
