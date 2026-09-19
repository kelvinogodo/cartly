import { describe, expect, it } from 'vitest';
import { formatOptionList, parseOptionList } from './options';

describe('option lists', () => {
  it('splits on commas and newlines and trims', () => {
    expect(parseOptionList(' S, M ,L\nXL ')).toEqual(['S', 'M', 'L', 'XL']);
  });

  it('drops blanks and case-insensitive duplicates, keeping the first spelling', () => {
    expect(parseOptionList('Navy,, navy , Black')).toEqual(['Navy', 'Black']);
  });

  it('returns an empty list for blank input', () => {
    expect(parseOptionList('  ')).toEqual([]);
  });

  it('round-trips through the form field', () => {
    expect(parseOptionList(formatOptionList(['36', '38', '40']))).toEqual(['36', '38', '40']);
  });
});
