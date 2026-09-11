import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
    'Locally: copy .env.example to .env.local and fill in your Supabase project values. ' +
    'On Vercel: add both as Environment Variables in the project settings, then redeploy — ' +
    '.env.local is gitignored and never reaches the build.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey);
