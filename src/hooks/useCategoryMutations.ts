import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/supabase';

type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const { error } = await supabase.from('categories').insert(category);
      if (error) throw new Error(error.code === '23505' ? 'A category with that name already exists.' : error.message);
    },
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CategoryUpdate }) => {
      const { error } = await supabase.from('categories').update(updates).eq('id', id);
      if (error) throw new Error(error.code === '23505' ? 'A category with that name already exists.' : error.message);
    },
    onSuccess: invalidate,
  });
}

/** Products in a deleted category are kept and become uncategorised (FK is ON DELETE SET NULL). */
export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}
