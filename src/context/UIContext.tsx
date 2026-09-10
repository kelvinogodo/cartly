import { createContext, useContext, useState, type ReactNode } from 'react';

interface UIContextValue {
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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const value: UIContextValue = {
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
