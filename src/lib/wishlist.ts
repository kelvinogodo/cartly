const GUEST_WISHLIST_KEY = 'cartly:guest-wishlist:v1';

export const GUEST_WISHLIST_STORAGE_KEY = GUEST_WISHLIST_KEY;

export function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id];
}

export function readGuestWishlist(): string[] {
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function writeGuestWishlist(ids: string[]): void {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids));
  } catch {
    // private browsing / storage disabled — wishlist just won't persist
  }
}

export function clearGuestWishlist(): void {
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
  } catch {
    // ignore
  }
}
