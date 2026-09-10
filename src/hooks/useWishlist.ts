import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('product_id')
        .eq('user_id', user!.id);
      if (error) throw error;
      return new Set(data.map((row) => row.product_id));
    },
    enabled: !!user,
  });

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Must be signed in to like a product');
      const isLiked = query.data?.has(productId) ?? false;
      if (isLiked) {
        const { error } = await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('wishlist_items')
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', user?.id] });
    },
  });

  return {
    likedIds: query.data ?? new Set<string>(),
    toggle: toggle.mutate,
  };
}
