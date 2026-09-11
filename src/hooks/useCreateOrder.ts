import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useCart } from './useCart';
import { computeCartTotal } from '../lib/cart';

interface ShippingDetails {
  name: string;
  address: string;
  phone: string;
}

export function useCreateOrder() {
  const { user } = useAuth();
  const { items, clear } = useCart();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shipping: ShippingDetails) => {
      if (!user) throw new Error('Must be signed in to place an order');
      if (items.length === 0) throw new Error('Cart is empty');

      const total = computeCartTotal(items);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total,
          shipping_name: shipping.name,
          shipping_address: shipping.address,
          shipping_phone: shipping.phone,
        })
        .select()
        .single();
      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.product.name,
        unit_price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      clear();
      queryClient.invalidateQueries({ queryKey: ['orders', user.id] });

      return order;
    },
  });
}
