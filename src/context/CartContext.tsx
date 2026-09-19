import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useProductsByIds } from '../hooks/useProductsByIds';
import {
  GUEST_CART_STORAGE_KEY,
  applyQuantity,
  cartCount,
  clearGuestCart,
  computeCartTotal,
  planAdd,
  readGuestCart,
  writeGuestCart,
  type AddResult,
  type GuestCartLine,
} from '../lib/cart';
import type { CartItem, Product } from '../types/domain';

export interface CartContextValue {
  items: CartItem[];
  /** Total units in the bag. */
  count: number;
  total: number;
  isLoading: boolean;
  addItem: (product: Product, quantity?: number) => AddResult;
  setQuantity: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

const EMPTY_ITEMS: CartItem[] = [];

async function fetchServerCart(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select('product_id, quantity, product:products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map((row) => ({ productId: row.product_id, quantity: row.quantity, product: row.product }));
}

// Folds a signed-out visitor's bag into their account's bag the moment they
// sign in, summing quantity (capped at stock) where a product already exists.
async function mergeGuestIntoServer(userId: string, lines: GuestCartLine[]): Promise<void> {
  const { data: existing } = await supabase.from('cart_items').select('product_id, quantity').eq('user_id', userId);
  const current = new Map((existing ?? []).map((row) => [row.product_id, row.quantity]));

  for (const line of lines) {
    const quantity = Math.min((current.get(line.productId) ?? 0) + line.quantity, Math.max(line.product.stock, 1));
    const { error } = await supabase
      .from('cart_items')
      .upsert({ user_id: userId, product_id: line.productId, quantity }, { onConflict: 'user_id,product_id' });
    if (error) console.error('Could not merge guest cart line:', error.message);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();

  // ---- guest bag: one piece of state shared by every consumer, mirrored to localStorage ----
  const [guestLines, setGuestLines] = useState<GuestCartLine[]>(() => readGuestCart());

  useEffect(() => {
    writeGuestCart(guestLines);
  }, [guestLines]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === GUEST_CART_STORAGE_KEY) setGuestLines(readGuestCart());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Refresh guest snapshots (price/stock) in the background and drop lines
  // whose product no longer exists. The UI never waits on this.
  const guestIds = useMemo(() => guestLines.map((line) => line.productId), [guestLines]);
  const fresh = useProductsByIds(user ? [] : guestIds);
  useEffect(() => {
    if (user || !fresh.isSuccess || fresh.isPlaceholderData || fresh.isFetching) return;
    const known = new Set(fresh.data.map((product) => product.id));
    if (guestIds.some((id) => !known.has(id))) {
      setGuestLines((lines) => lines.filter((line) => known.has(line.productId)));
    }
  }, [user, fresh.isSuccess, fresh.isPlaceholderData, fresh.isFetching, fresh.data, guestIds]);

  const guestItems = useMemo<CartItem[]>(() => {
    const freshById = new Map((fresh.data ?? []).map((product) => [product.id, product]));
    return guestLines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      product: freshById.get(line.productId) ?? line.product,
    }));
  }, [guestLines, fresh.data]);

  // ---- signed-in bag: the cart_items table, with optimistic updates ----
  const cartKey = useMemo(() => ['cart', user?.id ?? 'guest'] as const, [user?.id]);
  const serverQuery = useQuery({
    queryKey: cartKey,
    queryFn: () => fetchServerCart(user!.id),
    enabled: !!user,
  });
  const serverItems = serverQuery.data ?? EMPTY_ITEMS;

  const writeQuantity = useMutation({
    mutationFn: async ({ product, quantity }: { product: Product; quantity: number }) => {
      if (!user) throw new Error('Not signed in');
      if (quantity <= 0) {
        const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .upsert({ user_id: user.id, product_id: product.id, quantity }, { onConflict: 'user_id,product_id' });
        if (error) throw error;
      }
    },
    onMutate: async ({ product, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartKey);
      queryClient.setQueryData<CartItem[]>(cartKey, (current = []) => applyQuantity(current, product, quantity));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(cartKey, context.previous);
      toast.show({ id: 'cart-error', title: "Couldn't update your bag", description: 'Please try again.', tone: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  });

  const clearServer = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not signed in');
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartKey);
      queryClient.setQueryData<CartItem[]>(cartKey, []);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(cartKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  });

  const { mutate: writeQuantityMutate } = writeQuantity;
  const { mutate: clearServerMutate } = clearServer;

  // Merge a guest bag into the account the first time we see a signed-in user.
  const mergedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!user) {
      mergedFor.current = null;
      return;
    }
    if (mergedFor.current === user.id) return;
    mergedFor.current = user.id;
    const lines = readGuestCart();
    if (lines.length === 0) return;
    void (async () => {
      await mergeGuestIntoServer(user.id, lines);
      clearGuestCart();
      setGuestLines([]);
      await queryClient.invalidateQueries({ queryKey: ['cart', user.id] });
    })();
  }, [user, queryClient]);

  // ---- unified API ----
  const items = user ? serverItems : guestItems;

  const setQuantity = useCallback(
    (product: Product, requested: number) => {
      const quantity = Math.min(requested, product.stock);
      if (user) {
        writeQuantityMutate({ product, quantity });
      } else {
        setGuestLines((lines) => {
          if (quantity <= 0) return lines.filter((line) => line.productId !== product.id);
          const exists = lines.some((line) => line.productId === product.id);
          return exists
            ? lines.map((line) => (line.productId === product.id ? { ...line, quantity, product } : line))
            : [...lines, { productId: product.id, quantity, product }];
        });
      }
    },
    [user, writeQuantityMutate]
  );

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const addItem = useCallback(
    (product: Product, quantity = 1): AddResult => {
      const inBag = itemsRef.current.find((item) => item.productId === product.id)?.quantity ?? 0;
      const plan = planAdd(product, inBag, quantity);
      if (plan.result === 'added') setQuantity(product, plan.nextQuantity);
      return plan.result;
    },
    [setQuantity]
  );

  const removeItem = useCallback(
    (productId: string) => {
      const product = itemsRef.current.find((item) => item.productId === productId)?.product;
      if (product) setQuantity(product, 0);
    },
    [setQuantity]
  );

  const clear = useCallback(() => {
    if (user) {
      clearServerMutate();
    } else {
      setGuestLines([]);
    }
  }, [user, clearServerMutate]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      total: computeCartTotal(items),
      isLoading: user ? serverQuery.isLoading : false,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [items, user, serverQuery.isLoading, addItem, setQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
