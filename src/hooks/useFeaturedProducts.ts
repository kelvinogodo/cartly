import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
