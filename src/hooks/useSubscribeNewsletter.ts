import { useMutation } from '@tanstack/react-query';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface Subscription {
  email: string;
  /** Hidden field real visitors never fill in; bots do. */
  honeypot?: string;
}

export function useSubscribeNewsletter() {
  return useMutation<void, PostgrestError, Subscription>({
    mutationFn: async ({ email, honeypot }: Subscription) => {
      if (honeypot) return; // a bot: report success and drop it
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: email.trim() });
      if (error) throw error;
    },
  });
}
