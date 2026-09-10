import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { computeCartTotal } from '../lib/cart';
import type { CartItem, Product } from '../types/domain';

// In-memory only for now — Phase 5 adds localStorage persistence for guests
// plus a server-backed cart_items table (and merge-on-login) for signed-in
// users. This is the foundation those build on, not a throwaway stopgap.
interface UIContextValue {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  cartTotal: number;
  categoryFilter: string | null;
  setCategoryFilter: (categoryId: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function useUIContext(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, quantity: 1, product }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const cartTotal = useMemo(() => computeCartTotal(cartItems), [cartItems]);

  const value: UIContextValue = {
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    cartItems,
    addToCart,
    removeFromCart,
    cartTotal,
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
