import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { clearGuestCartLines, readGuestCartLines } from '../lib/cart';
import type { Profile } from '../types/domain';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) {
    console.error('Failed to load profile:', error.message);
    return null;
  }
  return data;
}

// Folds a signed-out visitor's localStorage cart into their real cart_items
// rows the moment they sign in, summing quantity where a row already exists.
async function mergeGuestCartIntoServerCart(userId: string): Promise<void> {
  const lines = readGuestCartLines();
  if (lines.length === 0) return;

  for (const line of lines) {
    const { data: existing, error: selectError } = await supabase
      .from('cart_items')
      .select('quantity')
      .eq('user_id', userId)
      .eq('product_id', line.productId)
      .maybeSingle();
    if (selectError) {
      console.error('Failed to check existing cart item during guest-cart merge:', selectError.message);
      continue;
    }
    if (existing) {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + line.quantity })
        .eq('user_id', userId)
        .eq('product_id', line.productId);
      if (error) console.error('Failed to merge cart item quantity:', error.message);
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: line.productId, quantity: line.quantity });
      if (error) console.error('Failed to insert merged cart item:', error.message);
    }
  }

  clearGuestCartLines();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      if (session?.user) {
        setProfile(await fetchProfile(session.user.id));
      }
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      setSession(session);
      setProfile(session?.user ? await fetchProfile(session.user.id) : null);

      if (event === 'SIGNED_IN' && session?.user) {
        await mergeGuestCartIntoServerCart(session.user.id);
        queryClient.invalidateQueries({ queryKey: ['cart', session.user.id] });
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [queryClient]);

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === 'admin',
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
