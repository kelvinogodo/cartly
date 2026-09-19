import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

// Capped so the home page grid always fills whole rows (4 columns x 2).
const FEATURED_LIMIT = 8;

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .order('name', { ascending: true })
        .limit(FEATURED_LIMIT);
      if (error) throw error;
      return data;
    },
  });
}
