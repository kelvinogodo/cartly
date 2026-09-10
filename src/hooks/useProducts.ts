import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

interface ProductFilters {
  categoryId?: string | null;
  search?: string;
}

export function useProducts(filters: ProductFilters = {}) {
  const { categoryId, search } = filters;
  return useQuery({
    queryKey: ['products', { categoryId: categoryId ?? null, search: search ?? '' }],
    queryFn: async () => {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
