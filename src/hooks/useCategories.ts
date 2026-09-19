import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });
}
