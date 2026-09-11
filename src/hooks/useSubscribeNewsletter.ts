import { useMutation } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export function useSubscribeNewsletter() {
  return useMutation<void, PostgrestError, string>({
    mutationFn: async (email: string) => {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email });
      if (error) throw error;
    },
  });
}
