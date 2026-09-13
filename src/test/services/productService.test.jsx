import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetch } from '../helpers';

describe('productService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProductsRequest construye query params', async () => {
    mockFetch([
      {
        url: (url) =>
          url.includes(
            'http://localhost:3001/api/products?category=Diver&limit=8&page=1'
          ),
        data: { data: { products: [], pagination: {} } },
      },
    ]);
    const { getProductsRequest } =
      await import('../../services/productService');
    await getProductsRequest({ category: 'Diver', limit: 8, page: 1 });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/products?category=Diver'),
      expect.any(Object)
    );
  });

  it('getCategoriesRequest llama a /products/categories', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/products/categories',
        data: { data: { categories: [] } },
      },
    ]);
    const { getCategoriesRequest } =
      await import('../../services/productService');
    const result = await getCategoriesRequest();
    expect(result).toEqual({ categories: [] });
  });

  it('getProductRequest llama a /products/:id', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/products/1',
        data: { data: { product: {} } },
      },
    ]);
    const { getProductRequest } = await import('../../services/productService');
    const result = await getProductRequest(1);
    expect(result).toEqual({ product: {} });
  });
});
