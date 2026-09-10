// Product images are either a root-relative path into public/images (seed
// data) or a full Supabase Storage public URL (admin-uploaded, added in a
// later phase) — both are already directly usable as an <img src>.
export function getProductImageUrl(imagePath: string): string {
  if (imagePath.startsWith('/') || imagePath.startsWith('http')) {
    return imagePath;
  }
  return `/images/${imagePath}`;
}
