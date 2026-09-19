import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function useClientErrors() {
  return useQuery({
    queryKey: ['admin', 'client-errors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_errors')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useClearClientErrors() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('client_errors').delete().gte('created_at', '1970-01-01');
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'client-errors'] }),
  });
}
