import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface CartDrawerValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

// Outside a provider the drawer is simply inert, so components that can open it
// (header, add-to-bag) stay usable in isolation, e.g. in unit tests.
const CartDrawerContext = createContext<CartDrawerValue>({ isOpen: false, open: () => {}, close: () => {} });

export function useCartDrawer(): CartDrawerValue {
  return useContext(CartDrawerContext);
}

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>;
}
