import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetch } from '../helpers';

describe('cartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCartRequest llama a /cart', async () => {
    mockFetch([
      { url: 'http://localhost:3001/api/cart', data: { data: { items: [] } } },
    ]);
    const { getCartRequest } = await import('../../services/cartService');
    const result = await getCartRequest();
    expect(result).toEqual({ items: [] });
  });

  it('addCartItemRequest llama a /cart/items', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/cart/items',
        data: { data: { item: {} } },
      },
    ]);
    const { addCartItemRequest } = await import('../../services/cartService');
    const result = await addCartItemRequest({ productId: 1, quantity: 2 });
    expect(result).toEqual({ item: {} });
  });

  it('updateCartItemRequest llama a /cart/items/:id', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/cart/items/1',
        data: { data: { item: {} } },
      },
    ]);
    const { updateCartItemRequest } =
      await import('../../services/cartService');
    const result = await updateCartItemRequest({ productId: 1, quantity: 3 });
    expect(result).toEqual({ item: {} });
  });

  it('removeCartItemRequest llama a /cart/items/:id', async () => {
    mockFetch([
      { url: 'http://localhost:3001/api/cart/items/1', data: { data: {} } },
    ]);
    const { removeCartItemRequest } =
      await import('../../services/cartService');
    const result = await removeCartItemRequest(1);
    expect(result).toEqual({});
  });

  it('mergeGuestCartRequest llama a /cart/merge', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/cart/merge',
        data: { data: { items: [] } },
      },
    ]);
    const { mergeGuestCartRequest } =
      await import('../../services/cartService');
    const result = await mergeGuestCartRequest([{ id: 1, quantity: 2 }]);
    expect(result).toEqual({ items: [] });
  });
});
