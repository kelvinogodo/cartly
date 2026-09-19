import { supabase } from './supabaseClient';

const PRODUCT_IMAGES_BUCKET = 'product-images';
const PUBLIC_URL_MARKER = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * The object path inside the bucket for an image URL we uploaded, or null for
 * anything else (seed images shipped in /public, external URLs) — those must
 * never be deleted from Storage.
 */
export function storagePathFromUrl(url: string): string | null {
  const at = url.indexOf(PUBLIC_URL_MARKER);
  if (at === -1) return null;
  const path = decodeURIComponent(url.slice(at + PUBLIC_URL_MARKER.length).split('?')[0] ?? '');
  return path || null;
}

/** Best-effort removal of uploaded images; a failure here must not block the caller. */
export async function removeStoredImages(urls: (string | null | undefined)[]): Promise<void> {
  const paths = urls.flatMap((u) => (u ? [storagePathFromUrl(u)] : [])).filter((p): p is string => !!p);
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  if (error) console.error('Failed to remove images from storage:', error.message);
}
