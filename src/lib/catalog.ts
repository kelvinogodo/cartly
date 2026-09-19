export const PAGE_SIZE = 12;

export type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'name', label: 'Name: A–Z' },
];

/** Escape LIKE wildcards so a search for "50%" matches literally instead of everything. */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Turns a text input into a non-negative price bound, or null when blank/invalid. */
export function parsePrice(value: string): number | null {
  if (value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Inclusive row range for a zero-based page, as expected by Supabase `.range()`. */
export function pageRange(page: number, pageSize = PAGE_SIZE): [number, number] {
  const from = Math.max(0, page) * pageSize;
  return [from, from + pageSize - 1];
}

export function pageCount(total: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}
