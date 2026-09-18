import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../helpers';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CheckoutPage from '../../pages/Checkout/Checkout';

const mockProduct = {
  id: 1,
  name: 'Watch 1',
  price: 100,
  description: 'Desc 1',
  image: 'img1.png',
  category: 'Diver',
};
const mockUser = {
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'customer',
};
const mockOrder = {
  id: 1,
  total: 100,
  shippingName: 'Test User',
  shippingAddress: '123 Main St',
  shippingCity: 'City',
  shippingZip: '12345',
  shippingPhone: '555-1234',
  items: [],
};

vi.mock('../../services/orderService', () => ({
  createOrderRequest: vi.fn(),
  getOrderRequest: vi.fn(),
  getUserOrdersRequest: vi.fn(),
}));

describe('Checkout integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carrito vacío muestra mensaje', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            user: mockUser,
            initialized: true,
            status: 'idle',
            error: null,
          },
          cart: { items: [], status: 'idle', error: null },
        },
        withRouter: false,
      }
    );

    expect(screen.getByText('Tu carrito está vacío')).toBeDefined();
  });

  it('mostrar productos del carrito y total', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            user: mockUser,
            initialized: true,
            status: 'idle',
            error: null,
          },
          cart: {
            items: [{ ...mockProduct, quantity: 2 }],
            status: 'idle',
            error: null,
          },
        },
        withRouter: false,
      }
    );

    expect(screen.getByText('Watch 1')).toBeDefined();
    expect(screen.getByText('Total: 200,00 COP')).toBeDefined();
  });

  it('validación de campos obligatorios', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            user: mockUser,
            initialized: true,
            status: 'idle',
            error: null,
          },
          cart: {
            items: [{ ...mockProduct, quantity: 1 }],
            status: 'idle',
            error: null,
          },
        },
        withRouter: false,
      }
    );

    const submitBtn = screen.getByRole('button', { name: /confirmar compra/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Información de envio \| Pago contraentrega/)).toBeDefined();
  });

  it('envío exitoso redirige a Thank You', async () => {
    const { createOrderRequest } = await import('../../services/orderService');
    createOrderRequest.mockResolvedValue({ order: mockOrder });

    const user = userEvent.setup();
    renderWithProviders(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thank-you" element={<div>Thank You Page</div>} />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            user: mockUser,
            initialized: true,
            status: 'idle',
            error: null,
          },
          cart: {
            items: [{ ...mockProduct, quantity: 1 }],
            status: 'idle',
            error: null,
          },
        },
        withRouter: false,
      }
    );

    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Test User');
    await user.type(textboxes[1], '123 Main St');
    await user.type(textboxes[2], 'City');
    await user.type(textboxes[3], '12345');
    await user.type(textboxes[4], '555-1234');
    await user.click(screen.getByRole('button', { name: /confirmar compra/i }));

    await waitFor(() => {
      expect(screen.getByText('Thank You Page')).toBeDefined();
    });
  });

  it('error al crear la orden muestra mensaje', async () => {
    const { createOrderRequest } = await import('../../services/orderService');
    createOrderRequest.mockRejectedValue(new Error('Server error'));

    const user = userEvent.setup();
    renderWithProviders(
      <MemoryRouter initialEntries={['/checkout']}>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          auth: {
            user: mockUser,
            initialized: true,
            status: 'idle',
            error: null,
          },
          cart: {
            items: [{ ...mockProduct, quantity: 1 }],
            status: 'idle',
            error: null,
          },
        },
        withRouter: false,
      }
    );

    const textboxes = screen.getAllByRole('textbox');
    await user.type(textboxes[0], 'Test User');
    await user.type(textboxes[1], '123 Main St');
    await user.type(textboxes[2], 'City');
    await user.type(textboxes[3], '12345');
    await user.type(textboxes[4], '555-1234');
    await user.click(screen.getByRole('button', { name: /confirmar compra/i }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeDefined();
    });
  });
});
