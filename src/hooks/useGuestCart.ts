import { useCallback, useState } from 'react';
import {
  clearGuestCartLines,
  mergeCartLine,
  readGuestCartLines,
  writeGuestCartLines,
  type CartLine,
} from '../lib/cart';

export function useGuestCart() {
  const [lines, setLines] = useState<CartLine[]>(() => readGuestCartLines());

  const addItem = useCallback((productId: string, quantity = 1) => {
    setLines((prev) => {
      const next = mergeCartLine(prev, productId, quantity);
      writeGuestCartLines(next);
      return next;
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setLines((prev) => {
      const next = prev.filter((line) => line.productId !== productId);
      writeGuestCartLines(next);
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) => {
      const next =
        quantity <= 0
          ? prev.filter((line) => line.productId !== productId)
          : prev.map((line) => (line.productId === productId ? { ...line, quantity } : line));
      writeGuestCartLines(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    clearGuestCartLines();
  }, []);

  return { lines, addItem, removeItem, setQuantity, clear };
}
