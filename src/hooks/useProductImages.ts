import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

/** Extra gallery photos for a product, in display order (the cover is products.image_path). */
export function useProductImages(productId: string | undefined) {
  return useQuery({
    queryKey: ['product', 'images', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId!)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}
