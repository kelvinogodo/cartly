import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './CartContext';
import { ToastProvider } from './ToastContext';
import { useCart } from '../hooks/useCart';
import { GUEST_CART_STORAGE_KEY } from '../lib/cart';
import type { Product } from '../types/domain';

vi.mock('../lib/supabaseClient', () => ({ supabase: {} }));
vi.mock('./AuthContext', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../hooks/useProductsByIds', () => ({
  useProductsByIds: () => ({ data: undefined, isSuccess: false, isPlaceholderData: false, isFetching: false }),
}));

function product(id: string, stock = 5): Product {
  return {
    id, slug: id, name: `Product ${id}`, description: null, price: 100, stock, category_id: null,
    image_path: '/images/x.jpg', size: null, color: null, made_in: null, is_featured: false,
    created_at: '', updated_at: '',
  };
}

const shirt = product('shirt');
const scarce = product('scarce', 1);

// Two *separate* components, like a product card and the header badge.
function AddButton({ item = shirt }: { item?: Product }) {
  const { addItem } = useCart();
  return <button onClick={() => addItem(item)}>add {item.id}</button>;
}
function BagBadge() {
  const { count } = useCart();
  return <span data-testid="badge">{count}</span>;
}

function renderApp(children: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => localStorage.clear());

describe('guest cart', () => {
  it('updates every consumer immediately when any component adds an item', () => {
    // Regression test: each useCart() call used to keep its own private copy of
    // the guest cart, so adding from a product card never updated the header.
    renderApp(<><AddButton /><BagBadge /></>);
    expect(screen.getByTestId('badge')).toHaveTextContent('0');

    fireEvent.click(screen.getByText('add shirt'));

    expect(screen.getByTestId('badge')).toHaveTextContent('1');
  });

  it('counts repeat adds as quantity, not extra lines', () => {
    renderApp(<><AddButton /><BagBadge /></>);
    fireEvent.click(screen.getByText('add shirt'));
    fireEvent.click(screen.getByText('add shirt'));
    fireEvent.click(screen.getByText('add shirt'));
    expect(screen.getByTestId('badge')).toHaveTextContent('3');
  });

  it('persists to localStorage so a refresh keeps the bag', () => {
    renderApp(<AddButton />);
    fireEvent.click(screen.getByText('add shirt'));
    const stored = JSON.parse(localStorage.getItem(GUEST_CART_STORAGE_KEY) ?? '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({ productId: 'shirt', quantity: 1 });
  });

  it('restores the bag from localStorage on load', () => {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify([{ productId: 'shirt', quantity: 2, product: shirt }]));
    renderApp(<BagBadge />);
    expect(screen.getByTestId('badge')).toHaveTextContent('2');
  });

  it('never lets the shopper add more than the available stock', () => {
    renderApp(<><AddButton item={scarce} /><BagBadge /></>);
    fireEvent.click(screen.getByText('add scarce'));
    fireEvent.click(screen.getByText('add scarce'));
    expect(screen.getByTestId('badge')).toHaveTextContent('1');
  });
});
