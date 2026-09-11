import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import { UIProvider } from '../context/UIContext';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types/domain';

vi.mock('../hooks/useCart');
vi.mock('../context/AuthContext');

function mockProduct(id: string): Product {
  return {
    id,
    slug: id,
    name: id,
    description: null,
    price: 10,
    stock: 1,
    category_id: null,
    image_path: '/images/x.png',
    size: null,
    color: null,
    made_in: null,
    is_featured: false,
    created_at: '',
    updated_at: '',
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

describe('Header cart badge', () => {
  it('shows the number of distinct cart lines, not the summed quantity', () => {
    // Regression check for the old Context bug where adding the same
    // product twice created two separate cart rows: the badge should
    // reflect distinct lines (2 products), and repeat-adds of the same
    // product must increment quantity rather than growing this count.
    vi.mocked(useCart).mockReturnValue({
      items: [
        { productId: 'p1', quantity: 2, product: mockProduct('p1') },
        { productId: 'p2', quantity: 1, product: mockProduct('p2') },
      ],
      isLoading: false,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      setQuantity: vi.fn(),
      clear: vi.fn(),
    });

    renderHeader();

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('hides the badge entirely when the cart is empty', () => {
    vi.mocked(useCart).mockReturnValue({
      items: [],
      isLoading: false,
      addItem: vi.fn(),
      removeItem: vi.fn(),
      setQuantity: vi.fn(),
      clear: vi.fn(),
    });

    renderHeader();

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
