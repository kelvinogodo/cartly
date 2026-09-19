import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { Product } from '../types/domain';

export function useProductsByIds(ids: string[]) {
  const key = [...ids].sort();
  return useQuery({
    queryKey: ['products', 'by-ids', key],
    queryFn: async (): Promise<Product[]> => {
      if (key.length === 0) return [];
      const { data, error } = await supabase.from('products').select('*').in('id', key);
      if (error) throw error;
      return data;
    },
    enabled: key.length > 0,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}
