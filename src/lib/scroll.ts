// Navigating to a section of the home page from elsewhere (e.g. footer "Women"
// while on a product page) needs the page to mount before we can scroll to it.
// The target is parked here and picked up by the home page once it's on screen.
let pending: string | null = null;

export function setPendingScroll(id: string): void {
  pending = id;
}

export function takePendingScroll(): string | null {
  const id = pending;
  pending = null;
  return id;
}

export function hasPendingScroll(): boolean {
  return pending !== null;
}

export function scrollToId(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
