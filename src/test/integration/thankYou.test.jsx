import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../helpers';
import { screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Thank from '../../pages/ThankYou/thank';

const mockOrder = {
  id: 1,
  total: 200,
  shipping_name: 'Test User',
  shipping_address: '123 Main St',
  shipping_city: 'City',
  shipping_zip: '12345',
  shipping_phone: '555-1234',
  items: [{ id: 1, name: 'Watch 1', quantity: 2, price: 100 }],
};

vi.mock('../../services/orderService', () => ({
  createOrderRequest: vi.fn(),
  getOrderRequest: vi.fn(),
  getUserOrdersRequest: vi.fn(),
}));

describe('Thank You integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga de la orden y muestra detalles', async () => {
    const { getOrderRequest } = await import('../../services/orderService');
    getOrderRequest.mockResolvedValue({ order: mockOrder });

    renderWithProviders(
      <MemoryRouter
        initialEntries={[{ pathname: '/thank-you', state: { orderId: 1 } }]}
      >
        <Thank />
      </MemoryRouter>,
      { withRouter: false }
    );

    await waitFor(() => {
      expect(screen.getByText(/Orden #1/)).toBeDefined();
    });
    expect(screen.getByText('Total: 200,00 COP')).toBeDefined();
    expect(
      screen.getByText(/Envío a: Test User, 123 Main St, City, 12345, 555-1234/)
    ).toBeDefined();
    expect(screen.getByText(/Watch 1 x2/)).toBeDefined();
  });

  it('manejo de error al cargar la orden', async () => {
    const { getOrderRequest } = await import('../../services/orderService');
    getOrderRequest.mockRejectedValue(new Error('Server error'));

    renderWithProviders(
      <MemoryRouter
        initialEntries={[{ pathname: '/thank-you', state: { orderId: 1 } }]}
      >
        <Thank />
      </MemoryRouter>,
      { withRouter: false }
    );

    await waitFor(() => {
      expect(screen.getByText(/No fue posible cargar la orden/i)).toBeDefined();
    });
  });

  it('sin orderId muestra mensaje genérico', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/thank-you']}>
        <Thank />
      </MemoryRouter>,
      { withRouter: false }
    );

    expect(screen.getByText('¡Gracias!')).toBeDefined();
    expect(
      screen.getByText('Tu compra se realizó con éxito. ¡Apreciamos tu compra!')
    ).toBeDefined();
  });
});
