import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function useProductById(id: string | undefined) {
  return useQuery({
    queryKey: ['product', 'by-id', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').eq('id', id as string).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
