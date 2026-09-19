import { useMutation } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface Inquiry {
  email: string;
  message: string;
  /** Hidden field real visitors never fill in; bots do. */
  honeypot?: string;
}

export function useSubmitInquiry() {
  return useMutation<void, PostgrestError, Inquiry>({
    mutationFn: async ({ email, message, honeypot }: Inquiry) => {
      if (honeypot) return; // a bot: report success and drop it
      const { error } = await supabase.from('inquiries').insert({ email: email.trim(), message: message.trim() });
      if (error) throw error;
    },
  });
}
