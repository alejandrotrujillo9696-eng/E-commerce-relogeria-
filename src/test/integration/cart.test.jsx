import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../helpers';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../../components/Cart/Cart';
import ProductCard from '../../components/ProductCard/ProductCard';
import { updateQuantity } from '../../features/cart/cartSlice';

const mockProduct = {
  id: 1,
  name: 'Watch 1',
  price: 100,
  description: 'Desc 1',
  image: 'img1.png',
  category: 'Diver',
  stock: 5,
};

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Cart integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('carrito vacío', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/cart']}>
        <Cart />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: { user: null, initialized: true, status: 'idle', error: null },
          cart: { items: [], status: 'idle', error: null },
        },
        withRouter: false,
      }
    );

    expect(screen.getByText('Tu carrito está vacío.')).toBeDefined();
  });

  it('mostrar producto agregado', async () => {
    const { store } = renderWithProviders(
      <MemoryRouter initialEntries={['/products']}>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: { user: null, initialized: true, status: 'idle', error: null },
          cart: { items: [], status: 'idle', error: null },
        },
        withRouter: false,
      }
    );

    fireEvent.click(screen.getByText('Añadir al carrito'));

    expect(store.getState().cart.items.length).toBe(1);
    expect(store.getState().cart.items[0].name).toBe('Watch 1');
  });

  it('modificar cantidad y eliminar producto', async () => {
    const { store } = renderWithProviders(
      <MemoryRouter initialEntries={['/cart']}>
        <Cart />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: { user: null, initialized: true, status: 'idle', error: null },
          cart: {
            items: [{ ...mockProduct, productId: mockProduct.id, quantity: 1 }],
            status: 'idle',
            error: null,
          },
        },
        withRouter: false,
      }
    );

    store.dispatch(updateQuantity({ id: 1, quantity: 2 }));
    expect(store.getState().cart.items[0].quantity).toBe(2);

    const removeBtn = screen.getByText('Eliminar');
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Watch 1')).toBeNull();
    });
  });

  it('botón pagar redirige a login si es guest', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/cart']}>
        <Cart />
      </MemoryRouter>,
      {
        preloadedState: {
          auth: { user: null, initialized: true, status: 'idle', error: null },
          cart: {
            items: [{ ...mockProduct, productId: mockProduct.id, quantity: 1 }],
            status: 'idle',
            error: null,
          },
        },
        withRouter: false,
      }
    );

    const payBtn = screen.getByRole('button', { name: 'Pagar' });
    fireEvent.click(payBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
