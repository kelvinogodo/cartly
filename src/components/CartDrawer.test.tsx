import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CartDrawer } from './CartDrawer';
import { CartDrawerProvider, useCartDrawer } from '../context/CartDrawerContext';
import { useCart } from '../hooks/useCart';
import type { CartItem, Product } from '../types/domain';

vi.mock('../hooks/useCart');

const product: Product = {
  id: 'p1', slug: 'coat', name: 'Wool Coat', description: null, price: 100, stock: 5, category_id: null,
  image_path: '/images/x.jpg', sizes: ['M'], colors: [], made_in: null, is_featured: false, created_at: '', updated_at: '',
};
const item: CartItem = { productId: 'p1', quantity: 2, size: 'M', color: '', product };

function Opener() {
  const { open } = useCartDrawer();
  return <button onClick={open}>open bag</button>;
}

const setQuantity = vi.fn();
const removeItem = vi.fn();

function mockCart(items: CartItem[]) {
  vi.mocked(useCart).mockReturnValue({
    items, count: items.reduce((n, i) => n + i.quantity, 0), total: items.reduce((n, i) => n + i.quantity * i.product.price, 0),
    isLoading: false, addItem: vi.fn(), setQuantity, removeItem, clear: vi.fn(),
  });
}

function setup() {
  return render(
    <MemoryRouter>
      <CartDrawerProvider>
        <Opener />
        <CartDrawer />
      </CartDrawerProvider>
    </MemoryRouter>
  );
}

beforeEach(() => vi.clearAllMocks());

describe('CartDrawer', () => {
  it('is closed until opened, then shows lines, options and subtotal', async () => {
    mockCart([item]);
    setup();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('open bag'));
    expect(screen.getByRole('dialog', { name: 'Your bag' })).toBeInTheDocument();
    expect(screen.getByText('Wool Coat')).toBeInTheDocument();
    expect(screen.getByText('Size M')).toBeInTheDocument();
    expect(screen.getAllByText('$200').length).toBeGreaterThan(0);
  });

  it('changes quantity for the right line and removes it', async () => {
    mockCart([item]);
    setup();
    await userEvent.click(screen.getByText('open bag'));
    await userEvent.click(screen.getByLabelText('Increase quantity of Wool Coat'));
    expect(setQuantity).toHaveBeenCalledWith(product, { size: 'M', color: '' }, 3);
    await userEvent.click(screen.getByLabelText('Remove Wool Coat'));
    expect(removeItem).toHaveBeenCalledWith({ productId: 'p1', size: 'M', color: '' });
  });

  it('closes on Escape', async () => {
    mockCart([item]);
    setup();
    await userEvent.click(screen.getByText('open bag'));
    await userEvent.keyboard('{Escape}');
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows an empty state with no checkout button', async () => {
    mockCart([]);
    setup();
    await userEvent.click(screen.getByText('open bag'));
    expect(screen.getByText('Your bag is empty.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Checkout' })).not.toBeInTheDocument();
  });
});
