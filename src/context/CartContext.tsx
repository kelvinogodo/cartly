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
  lineKey,
  planAdd,
  resolveSelection,
  sameLine,
  unitsOfProduct,
  readGuestCart,
  writeGuestCart,
  type AddResult,
  type GuestCartLine,
} from '../lib/cart';
import type { CartItem, OptionSelection, Product } from '../types/domain';

export interface CartContextValue {
  items: CartItem[];
  /** Total units in the bag. */
  count: number;
  total: number;
  isLoading: boolean;
  /** Adds to the bag; resolves to 'needs_option' when a size/colour still has to be chosen. */
  addItem: (product: Product, quantity?: number, chosen?: Partial<OptionSelection>) => AddResult;
  setQuantity: (product: Product, selection: OptionSelection, quantity: number) => void;
  removeItem: (line: { productId: string } & OptionSelection) => void;
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
    .select('product_id, quantity, size, color, product:products(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map((row) => ({
    productId: row.product_id,
    quantity: row.quantity,
    size: row.size,
    color: row.color,
    product: row.product,
  }));
}

// Folds a signed-out visitor's bag into their account's bag the moment they
// sign in, summing quantity where the same product+size+colour already exists.
// Stock is shared by every size of a product, so the total is capped at stock.
async function mergeGuestIntoServer(userId: string, lines: GuestCartLine[]): Promise<void> {
  const { data: existing } = await supabase.from('cart_items').select('product_id, quantity, size, color').eq('user_id', userId);
  const current = new Map((existing ?? []).map((row) => [lineKey({ productId: row.product_id, size: row.size, color: row.color }), row.quantity]));
  const perProduct = new Map<string, number>();
  for (const row of existing ?? []) perProduct.set(row.product_id, (perProduct.get(row.product_id) ?? 0) + row.quantity);

  for (const line of lines) {
    const key = lineKey(line);
    const room = Math.max(line.product.stock - (perProduct.get(line.productId) ?? 0), 0);
    const add = Math.min(line.quantity, room);
    if (add <= 0) continue;
    perProduct.set(line.productId, (perProduct.get(line.productId) ?? 0) + add);
    const quantity = (current.get(key) ?? 0) + add;
    const { error } = await supabase
      .from('cart_items')
      .upsert(
        { user_id: userId, product_id: line.productId, size: line.size, color: line.color, quantity },
        { onConflict: 'user_id,product_id,size,color' }
      );
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
      size: line.size,
      color: line.color,
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
    mutationFn: async ({ product, selection, quantity }: { product: Product; selection: OptionSelection; quantity: number }) => {
      if (!user) throw new Error('Not signed in');
      if (quantity <= 0) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .eq('size', selection.size)
          .eq('color', selection.color);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .upsert(
            { user_id: user.id, product_id: product.id, size: selection.size, color: selection.color, quantity },
            { onConflict: 'user_id,product_id,size,color' }
          );
        if (error) throw error;
      }
    },
    onMutate: async ({ product, selection, quantity }) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData<CartItem[]>(cartKey);
      queryClient.setQueryData<CartItem[]>(cartKey, (current = []) => applyQuantity(current, product, selection, quantity));
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
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const setQuantity = useCallback(
    (product: Product, selection: OptionSelection, requested: number) => {
      // every size/colour of a product draws from the same stock pool
      const target = { productId: product.id, ...selection };
      const others = itemsRef.current.reduce(
        (sum, item) => (item.productId === product.id && !sameLine(item, target) ? sum + item.quantity : sum),
        0
      );
      const quantity = Math.min(requested, Math.max(product.stock - others, 0));
      if (user) {
        writeQuantityMutate({ product, selection, quantity });
      } else {
        setGuestLines((lines) => {
          if (quantity <= 0) return lines.filter((line) => !sameLine(line, target));
          const exists = lines.some((line) => sameLine(line, target));
          return exists
            ? lines.map((line) => (sameLine(line, target) ? { ...line, quantity, product } : line))
            : [...lines, { productId: product.id, quantity, product, ...selection }];
        });
      }
    },
    [user, writeQuantityMutate]
  );

  const addItem = useCallback(
    (product: Product, quantity = 1, chosen: Partial<OptionSelection> = {}): AddResult => {
      const { selection, missing } = resolveSelection(product, chosen);
      if (missing) return 'needs_option';
      const inBag = unitsOfProduct(itemsRef.current, product.id);
      const plan = planAdd(product, inBag, quantity);
      if (plan.result === 'added') {
        const target = { productId: product.id, ...selection };
        const lineQty = itemsRef.current.find((item) => sameLine(item, target))?.quantity ?? 0;
        setQuantity(product, selection, lineQty + (plan.nextQuantity - inBag));
      }
      return plan.result;
    },
    [setQuantity]
  );

  const removeItem = useCallback(
    (line: { productId: string } & OptionSelection) => {
      const product = itemsRef.current.find((item) => sameLine(item, line))?.product;
      if (product) setQuantity(product, { size: line.size, color: line.color }, 0);
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
