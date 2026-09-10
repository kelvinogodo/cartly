import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useGuestCart } from './useGuestCart';
import type { CartItem, Product } from '../types/domain';

export interface CartHookResult {
  items: CartItem[];
  isLoading: boolean;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

function useGuestCartItems(): CartHookResult {
  const guest = useGuestCart();
  const ids = guest.lines.map((line) => line.productId);

  const productsQuery = useQuery({
    queryKey: ['products', 'by-ids', ids],
    queryFn: async () => {
      if (ids.length === 0) return [] as Product[];
      const { data, error } = await supabase.from('products').select('*').in('id', ids);
      if (error) throw error;
      return data;
    },
  });

  const items: CartItem[] = guest.lines.flatMap((line) => {
    const product = productsQuery.data?.find((p) => p.id === line.productId);
    return product ? [{ productId: line.productId, quantity: line.quantity, product }] : [];
  });

  return {
    items,
    isLoading: productsQuery.isLoading,
    addItem: guest.addItem,
    removeItem: guest.removeItem,
    setQuantity: guest.setQuantity,
    clear: guest.clear,
  };
}

function useServerCartItems(): CartHookResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const cartKey = ['cart', user?.id] as const;

  const cartQuery = useQuery({
    queryKey: cartKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cart_items')
        .select('product_id, quantity, product:products(*)')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data.map(
        (row): CartItem => ({
          productId: row.product_id,
          quantity: row.quantity,
          product: row.product,
        })
      );
    },
    enabled: !!user,
  });

  const items = cartQuery.data ?? [];
  const invalidate = () => queryClient.invalidateQueries({ queryKey: cartKey });

  const addItemMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!user) throw new Error('Must be signed in');
      const existing = items.find((item) => item.productId === productId);
      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity });
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Must be signed in');
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const setQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (!user) throw new Error('Must be signed in');
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be signed in');
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    items,
    isLoading: cartQuery.isLoading,
    addItem: (productId, quantity = 1) => addItemMutation.mutate({ productId, quantity }),
    removeItem: (productId) => removeItemMutation.mutate(productId),
    setQuantity: (productId, quantity) => setQuantityMutation.mutate({ productId, quantity }),
    clear: () => clearMutation.mutate(),
  };
}

// Always calls both underlying hooks (each internally gates its own network
// activity via React Query's `enabled`) so the hook-call order stays fixed
// across renders even as `user` changes — only which result is *returned*
// is conditional.
export function useCart(): CartHookResult {
  const { user } = useAuth();
  const guestCart = useGuestCartItems();
  const serverCart = useServerCartItems();
  return user ? serverCart : guestCart;
}
