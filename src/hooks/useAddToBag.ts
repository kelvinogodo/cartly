import { useCallback } from 'react';
import { useCart } from './useCart';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types/domain';

/** Adds to the bag and gives the shopper immediate, honest feedback about what happened. */
export function useAddToBag() {
  const { addItem } = useCart();
  const toast = useToast();

  return useCallback(
    (product: Product, quantity = 1) => {
      const result = addItem(product, quantity);
      if (result === 'added') {
        toast.show({
          id: `bag-${product.id}`,
          title: 'Added to bag',
          description: product.name,
          image: product.image_path,
          action: { label: 'View bag', to: '/cart' },
        });
      } else if (result === 'sold_out') {
        toast.show({ id: `bag-${product.id}`, title: 'Sold out', description: product.name, tone: 'error' });
      } else {
        toast.show({
          id: `bag-${product.id}`,
          title: `You already have all ${product.stock} in your bag`,
          description: product.name,
          tone: 'error',
        });
      }
      return result;
    },
    [addItem, toast]
  );
}
