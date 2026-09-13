import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '../helpers';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProductList from '../../pages/Product/ProductList';

const mockProducts = [
  {
    id: 1,
    name: 'Watch 1',
    price: 100,
    description: 'Desc 1',
    image: 'img1.png',
    category: 'Diver',
  },
  {
    id: 2,
    name: 'Watch 2',
    price: 200,
    description: 'Desc 2',
    image: 'img2.png',
    category: 'Classic',
  },
];
const mockCategories = [
  { id: 1, name: 'Diver' },
  { id: 2, name: 'Classic' },
];

vi.mock('../../services/productService', () => ({
  getProductsRequest: vi.fn(),
  getCategoriesRequest: vi.fn(),
  getProductRequest: vi.fn(),
}));

describe('Products integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga y muestra productos', async () => {
    const { getProductsRequest, getCategoriesRequest } =
      await import('../../services/productService');
    getCategoriesRequest.mockResolvedValue({ categories: mockCategories });
    getProductsRequest.mockResolvedValue({
      products: mockProducts,
      pagination: { totalPages: 1 },
    });

    renderWithProviders(
      <MemoryRouter initialEntries={['/products']}>
        <ProductList />
      </MemoryRouter>,
      { withRouter: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Watch 1')).toBeDefined();
      expect(screen.getByText('Watch 2')).toBeDefined();
    });
  });

  it('muestra estado de carga mientras obtiene productos', async () => {
    const { getProductsRequest, getCategoriesRequest } =
      await import('../../services/productService');
    getCategoriesRequest.mockResolvedValue({ categories: mockCategories });
    getProductsRequest.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(
      <MemoryRouter initialEntries={['/products']}>
        <ProductList />
      </MemoryRouter>,
      { withRouter: false }
    );

    expect(screen.getByText('Cargando productos…')).toBeDefined();
  });

  it('muestra error cuando la API falla', async () => {
    const { getProductsRequest, getCategoriesRequest } =
      await import('../../services/productService');
    getCategoriesRequest.mockRejectedValue(new Error('Server error'));
    getProductsRequest.mockRejectedValue(new Error('Server error'));

    renderWithProviders(
      <MemoryRouter initialEntries={['/products']}>
        <ProductList />
      </MemoryRouter>,
      { withRouter: false }
    );

    await waitFor(() => {
      expect(
        screen.getByText(/No fue posible cargar los productos/i)
      ).toBeDefined();
    });
  });

  it('filtra productos por búsqueda', async () => {
    const { getProductsRequest, getCategoriesRequest } =
      await import('../../services/productService');
    getCategoriesRequest.mockResolvedValue({ categories: mockCategories });
    getProductsRequest.mockResolvedValue({
      products: mockProducts,
      pagination: { totalPages: 1 },
    });

    const user = userEvent.setup();
    renderWithProviders(
      <MemoryRouter initialEntries={['/products']}>
        <ProductList />
      </MemoryRouter>,
      { withRouter: false }
    );

    await waitFor(() => {
      expect(screen.getByText('Watch 1')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText('Buscar por nombre');
    await user.type(searchInput, 'Watch 1');

    getProductsRequest.mockResolvedValue({
      products: [mockProducts[0]],
      pagination: { totalPages: 1 },
    });

    await waitFor(() => {
      expect(screen.getByText('Watch 1')).toBeDefined();
    });
  });
});
