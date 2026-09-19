import { useCallback } from 'react';
import { useCart } from './useCart';
import { useToast } from '../context/ToastContext';
import { useCartDrawer } from '../context/CartDrawerContext';
import type { OptionSelection, Product } from '../types/domain';

/** Adds to the bag and gives the shopper immediate, honest feedback about what happened. */
export function useAddToBag() {
  const { addItem } = useCart();
  const toast = useToast();
  const { open: openDrawer } = useCartDrawer();

  return useCallback(
    (product: Product, quantity = 1, chosen: Partial<OptionSelection> = {}) => {
      const result = addItem(product, quantity, chosen);
      if (result === 'added') {
        // the slide-over bag is the confirmation
        openDrawer();
      } else if (result === 'needs_option') {
        toast.show({
          id: `bag-${product.id}`,
          title: product.sizes.length > 1 && !chosen.size ? 'Choose a size first' : 'Choose a colour first',
          description: product.name,
          tone: 'error',
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
    [addItem, toast, openDrawer]
  );
}
