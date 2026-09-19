import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import {
  GUEST_WISHLIST_STORAGE_KEY,
  clearGuestWishlist,
  readGuestWishlist,
  toggleId,
  writeGuestWishlist,
} from '../lib/wishlist';
import type { Product } from '../types/domain';

export interface WishlistContextValue {
  likedIds: Set<string>;
  count: number;
  isLoading: boolean;
  isLiked: (productId: string) => boolean;
  toggle: (product: Product) => void;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function useWishlistContext(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

const EMPTY_IDS: string[] = [];

async function fetchServerWishlist(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('wishlist_items').select('product_id').eq('user_id', userId);
  if (error) throw error;
  return data.map((row) => row.product_id);
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  // ---- guest wishlist: shared state mirrored to localStorage ----
  const [guestIds, setGuestIds] = useState<string[]>(() => readGuestWishlist());

  useEffect(() => {
    writeGuestWishlist(guestIds);
  }, [guestIds]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === GUEST_WISHLIST_STORAGE_KEY) setGuestIds(readGuestWishlist());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // ---- signed-in wishlist: wishlist_items table, optimistic ----
  const wishlistKey = useMemo(() => ['wishlist', user?.id ?? 'guest'] as const, [user?.id]);
  const serverQuery = useQuery({
    queryKey: wishlistKey,
    queryFn: () => fetchServerWishlist(user!.id),
    enabled: !!user,
  });
  const serverIds = serverQuery.data ?? EMPTY_IDS;

  const setLiked = useMutation({
    mutationFn: async ({ productId, like }: { productId: string; like: boolean }) => {
      if (!user) throw new Error('Not signed in');
      if (like) {
        const { error } = await supabase
          .from('wishlist_items')
          .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id', ignoreDuplicates: true });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', productId);
        if (error) throw error;
      }
    },
    onMutate: async ({ productId, like }) => {
      await queryClient.cancelQueries({ queryKey: wishlistKey });
      const previous = queryClient.getQueryData<string[]>(wishlistKey);
      queryClient.setQueryData<string[]>(wishlistKey, (current = []) =>
        like ? (current.includes(productId) ? current : [...current, productId]) : current.filter((id) => id !== productId)
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(wishlistKey, context.previous);
      toast.show({ id: 'wishlist-error', title: "Couldn't update your wishlist", description: 'Please try again.', tone: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: wishlistKey }),
  });
  const { mutate: setLikedMutate } = setLiked;

  // Merge a guest wishlist into the account the first time we see a signed-in user.
  const mergedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!user) {
      mergedFor.current = null;
      return;
    }
    if (mergedFor.current === user.id) return;
    mergedFor.current = user.id;
    const ids = readGuestWishlist();
    if (ids.length === 0) return;
    void (async () => {
      const rows = ids.map((productId) => ({ user_id: user.id, product_id: productId }));
      const { error } = await supabase
        .from('wishlist_items')
        .upsert(rows, { onConflict: 'user_id,product_id', ignoreDuplicates: true });
      if (error) console.error('Could not merge guest wishlist:', error.message);
      clearGuestWishlist();
      setGuestIds([]);
      await queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
    })();
  }, [user, queryClient]);

  // ---- unified API ----
  const ids = user ? serverIds : guestIds;
  const likedIds = useMemo(() => new Set(ids), [ids]);
  const likedRef = useRef(likedIds);
  likedRef.current = likedIds;

  const toggle = useCallback(
    (product: Product) => {
      const like = !likedRef.current.has(product.id);
      if (user) {
        setLikedMutate({ productId: product.id, like });
      } else {
        setGuestIds((current) => toggleId(current, product.id));
      }
      toast.show({
        id: `wishlist-${product.id}`,
        title: like ? 'Saved to wishlist' : 'Removed from wishlist',
        description: product.name,
        image: product.image_path,
        action: like ? { label: 'View', to: '/wishlist' } : undefined,
        duration: 2800,
      });
    },
    [user, setLikedMutate, toast]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      likedIds,
      count: likedIds.size,
      isLoading: user ? serverQuery.isLoading : false,
      isLiked: (productId: string) => likedIds.has(productId),
      toggle,
    }),
    [likedIds, user, serverQuery.isLoading, toggle]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
