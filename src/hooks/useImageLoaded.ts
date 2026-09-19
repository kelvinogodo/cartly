import { useCallback, useEffect, useRef, useState } from 'react';

/** Tracks when an <img> has finished loading (including cache hits) so it can fade in. */
export function useImageLoaded(src: string) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(!!ref.current?.complete && (ref.current?.naturalWidth ?? 0) > 0);
  }, [src]);

  const onLoad = useCallback(() => setLoaded(true), []);
  return { ref, loaded, onLoad };
}
