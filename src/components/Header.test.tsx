import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { UIProvider } from '../context/UIContext';
import { useCart, type CartHookResult } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';

vi.mock('../hooks/useCart');
vi.mock('../hooks/useWishlist');
vi.mock('../context/AuthContext');
vi.mock('../hooks/useCategories');

function cartValue(count: number): CartHookResult {
  return {
    items: [],
    count,
    total: 0,
    isLoading: false,
    addItem: vi.fn(),
    setQuantity: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
}

function renderHeader() {
  return render(
    <MemoryRouter>
      <UIProvider>
        <Header />
      </UIProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(useCategories).mockReturnValue({ data: [], isLoading: false, error: null } as unknown as ReturnType<typeof useCategories>);
  vi.mocked(useWishlist).mockReturnValue({
    likedIds: new Set<string>(),
    count: 0,
    isLoading: false,
    isLiked: () => false,
    toggle: vi.fn(),
  });
  vi.mocked(useAuth).mockReturnValue({
    session: null,
    user: null,
    profile: null,
    isAdmin: false,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  });
});

describe('Header bag badge', () => {
  it('shows the total number of units in the bag', () => {
    vi.mocked(useCart).mockReturnValue(cartValue(3));
    renderHeader();
    expect(screen.getByLabelText('Bag, 3 items')).toHaveTextContent('3');
  });

  it('shows no badge when the bag is empty', () => {
    vi.mocked(useCart).mockReturnValue(cartValue(0));
    renderHeader();
    expect(screen.getByLabelText('Bag, 0 items')).toHaveTextContent('');
  });
});

describe('Header wishlist badge', () => {
  it('shows how many pieces are saved', () => {
    vi.mocked(useCart).mockReturnValue(cartValue(0));
    vi.mocked(useWishlist).mockReturnValue({
      likedIds: new Set(['a', 'b']),
      count: 2,
      isLoading: false,
      isLiked: () => true,
      toggle: vi.fn(),
    });
    renderHeader();
    expect(screen.getByLabelText('Wishlist, 2 saved')).toHaveTextContent('2');
  });
});
