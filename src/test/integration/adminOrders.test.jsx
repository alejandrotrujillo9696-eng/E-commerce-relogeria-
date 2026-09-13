import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../helpers';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminOrders from '../../pages/Admin/Orders';

const mockOrder = {
  id: 1,
  user_id: 1,
  total: 200,
  status: 'paid',
  created_at: '2024-01-01T00:00:00.000Z',
  first_name: 'Test',
  last_name: 'User',
  email: 'test@example.com',
  shipping_name: 'Test User',
  shipping_address: '123 Main St',
  shipping_city: 'City',
  shipping_zip: '12345',
  shipping_phone: '555-1234',
  items: [{ id: 1, name: 'Watch 1', quantity: 2, price: 100 }],
};

vi.mock('../../services/apiClient', () => ({
  default: vi.fn(),
}));

describe('Admin Orders integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra datos de envío en detalle de orden', async () => {
    const { default: apiClient } = await import('../../services/apiClient');
    apiClient.mockResolvedValueOnce({ orders: [mockOrder] });
    apiClient.mockResolvedValueOnce({ order: mockOrder });

    renderWithProviders(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <AdminOrders />
      </MemoryRouter>,
      { withRouter: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Ver')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Ver'));

    await waitFor(() => {
      expect(screen.getByText('ID: 01')).toBeDefined();
    });

    expect(screen.getByText(/test@example.com/)).toBeDefined();
    expect(screen.getByText(/123 Main St, City, 12345/)).toBeDefined();
  });

  it('busca una orden por ID existente', async () => {
    const { default: apiClient } = await import('../../services/apiClient');
    apiClient.mockResolvedValueOnce({ orders: [mockOrder] });
    apiClient.mockResolvedValueOnce({ orders: [mockOrder] });

    renderWithProviders(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <AdminOrders />
      </MemoryRouter>,
      { withRouter: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Ver')).toBeDefined();
    });

    fireEvent.change(screen.getByPlaceholderText('Ej: 05'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByText('Buscar'));

    expect(apiClient).toHaveBeenNthCalledWith(2, '/admin/orders?search=5');
  });

  it('limpia la búsqueda y restaura la lista completa', async () => {
    const { default: apiClient } = await import('../../services/apiClient');
    apiClient.mockResolvedValueOnce({ orders: [mockOrder] });
    apiClient.mockResolvedValueOnce({ orders: [mockOrder] });

    renderWithProviders(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <AdminOrders />
      </MemoryRouter>,
      { withRouter: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Ver')).toBeDefined();
    });

    fireEvent.change(screen.getByPlaceholderText('Ej: 05'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByText('Buscar'));
    await waitFor(() => {
      expect(screen.getByText('Limpiar')).toBeDefined();
    });
    fireEvent.click(screen.getByText('Limpiar'));

    expect(apiClient).toHaveBeenCalledTimes(3);
  });

  it('no busca cuando el campo está vacío', async () => {
    const { default: apiClient } = await import('../../services/apiClient');
    apiClient.mockResolvedValueOnce({ orders: [mockOrder] });

    renderWithProviders(
      <MemoryRouter initialEntries={['/admin/orders']}>
        <AdminOrders />
      </MemoryRouter>,
      { withRouter: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Ver')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Buscar'));

    expect(apiClient).toHaveBeenCalledWith('/admin/orders');
  });
});
