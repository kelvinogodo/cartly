import { useMutation } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface Inquiry {
  email: string;
  message: string;
}

export function useSubmitInquiry() {
  return useMutation<void, PostgrestError, Inquiry>({
    mutationFn: async ({ email, message }: Inquiry) => {
      const { error } = await supabase.from('inquiries').insert({ email, message });
      if (error) throw error;
    },
  });
}
