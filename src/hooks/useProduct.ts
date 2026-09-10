import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug as string).single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
