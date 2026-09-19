import { useEffect } from 'react';

const BASE_TITLE = 'Cartly';
export const DEFAULT_DESCRIPTION = 'Cartly — curated menswear, womenswear, footwear and accessories.';

/**
 * Sets the tab title and the meta description for the current page. (Link-preview
 * bots read the server-rendered tags instead — see api/product-meta.ts — but
 * search engines that run JavaScript pick up these.)
 */
export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
  }, [title]);

  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) return;
    meta.content = description || DEFAULT_DESCRIPTION;
    return () => {
      meta.content = DEFAULT_DESCRIPTION;
    };
  }, [description]);
}
