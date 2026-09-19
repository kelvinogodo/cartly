import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WishlistProvider } from './WishlistContext';
import { ToastProvider } from './ToastContext';
import { useWishlist } from '../hooks/useWishlist';
import { GUEST_WISHLIST_STORAGE_KEY } from '../lib/wishlist';
import type { Product } from '../types/domain';

vi.mock('../lib/supabaseClient', () => ({ supabase: {} }));
vi.mock('./AuthContext', () => ({ useAuth: () => ({ user: null }) }));

const dress: Product = {
  id: 'dress', slug: 'dress', name: 'Day dress', description: null, price: 200, stock: 4, category_id: null,
  image_path: '/images/x.jpg', size: null, color: null, made_in: null, is_featured: false, created_at: '', updated_at: '',
};

function HeartButton() {
  const { toggle, isLiked } = useWishlist();
  return <button onClick={() => toggle(dress)}>{isLiked('dress') ? 'liked' : 'not liked'}</button>;
}
function Count() {
  const { count } = useWishlist();
  return <span data-testid="count">{count}</span>;
}

function renderApp(children: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <ToastProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => localStorage.clear());

describe('guest wishlist', () => {
  it('lets a signed-out visitor like a product (no login redirect) and reflects it everywhere', () => {
    // Regression test: liking used to bounce guests to /login, so hearts "did nothing".
    renderApp(<><HeartButton /><Count /></>);
    expect(screen.getByText('not liked')).toBeInTheDocument();

    fireEvent.click(screen.getByText('not liked'));

    expect(screen.getByText('liked')).toBeInTheDocument();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it('un-likes on a second tap', () => {
    renderApp(<><HeartButton /><Count /></>);
    fireEvent.click(screen.getByText('not liked'));
    fireEvent.click(screen.getByText('liked'));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('persists likes to localStorage', () => {
    renderApp(<HeartButton />);
    fireEvent.click(screen.getByText('not liked'));
    expect(JSON.parse(localStorage.getItem(GUEST_WISHLIST_STORAGE_KEY) ?? '[]')).toEqual(['dress']);
  });
});
