import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockFetch } from '../helpers';

describe('orderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createOrderRequest llama a /orders', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/orders',
        data: { data: { order: {} } },
      },
    ]);
    const { createOrderRequest } = await import('../../services/orderService');
    const result = await createOrderRequest({ shippingName: 'Test' });
    expect(result).toEqual({ order: {} });
  });

  it('getOrderRequest llama a /orders/:id', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/orders/1',
        data: { data: { order: {} } },
      },
    ]);
    const { getOrderRequest } = await import('../../services/orderService');
    const result = await getOrderRequest(1);
    expect(result).toEqual({ order: {} });
  });

  it('getUserOrdersRequest llama a /orders', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/orders',
        data: { data: { orders: [] } },
      },
    ]);
    const { getUserOrdersRequest } =
      await import('../../services/orderService');
    const result = await getUserOrdersRequest();
    expect(result).toEqual({ orders: [] });
  });

  it('cancelOrderRequest llama a PATCH /orders/:id/cancel', async () => {
    mockFetch([
      {
        url: 'http://localhost:3001/api/orders/1/cancel',
        method: 'PATCH',
        data: { data: { id: 1, status: 'cancelled' } },
      },
    ]);
    const { cancelOrderRequest } = await import('../../services/orderService');
    const result = await cancelOrderRequest(1);
    expect(result).toEqual({ id: 1, status: 'cancelled' });
  });
});
