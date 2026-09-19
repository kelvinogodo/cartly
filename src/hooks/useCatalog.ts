import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { escapeLike, pageRange, PAGE_SIZE, type SortKey } from '../lib/catalog';

export interface CatalogQuery {
  categoryId: string | null;
  search: string;
  sort: SortKey;
  minPrice: number | null;
  maxPrice: number | null;
  page: number; // zero-based
}

/** Filtered, sorted, paginated catalog query — everything is done in Postgres. */
export function useCatalog(q: CatalogQuery) {
  return useQuery({
    queryKey: ['products', 'catalog', q],
    queryFn: async () => {
      let query = supabase.from('products').select('*', { count: 'exact' });
      if (q.categoryId) query = query.eq('category_id', q.categoryId);
      if (q.search) query = query.ilike('name', `%${escapeLike(q.search)}%`);
      if (q.minPrice !== null) query = query.gte('price', q.minPrice);
      if (q.maxPrice !== null) query = query.lte('price', q.maxPrice);

      switch (q.sort) {
        case 'price-asc':
          query = query.order('price', { ascending: true }).order('name');
          break;
        case 'price-desc':
          query = query.order('price', { ascending: false }).order('name');
          break;
        case 'name':
          query = query.order('name');
          break;
        default:
          query = query.order('created_at', { ascending: false }).order('name');
      }

      const [from, to] = pageRange(q.page, PAGE_SIZE);
      const { data, error, count } = await query.range(from, to);
      if (error) throw error;
      return { products: data, total: count ?? data.length };
    },
    placeholderData: keepPreviousData,
  });
}
