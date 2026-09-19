import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from './useCart';

interface ShippingDetails {
  name: string;
  address: string;
  phone: string;
}

/**
 * Places an order through the `place_order` database function. Only product ids
 * and quantities are sent — prices, totals and stock are all resolved on the
 * server inside one transaction, so a tampered client can't change what it pays.
 */
export function useCreateOrder() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shipping: ShippingDetails) => {
      if (!user) throw new Error('Must be signed in to place an order');
      if (items.length === 0) throw new Error('Your bag is empty');

      const { data, error } = await supabase.rpc('place_order', {
        p_shipping_name: shipping.name,
        p_shipping_address: shipping.address,
        p_shipping_phone: shipping.phone,
        p_items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      clear();
      // Stock changed, so cached product data (cards, detail pages) is stale.
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      if (user) queryClient.invalidateQueries({ queryKey: ['orders', user.id] });
    },
  });
}
