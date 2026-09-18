import { jest } from '@jest/globals';
import { findMonthlyFeaturedProduct } from '../src/models/homeModel.js';

describe('monthly featured product', () => {
  test('returns the top product for the requested month', async () => {
    const executor = {
      execute: jest.fn().mockResolvedValueOnce([
        [
          {
            id: 7,
            name: 'Watch 7',
            price: '250.00',
            sold_quantity: '8',
            latest_sale_at: '2026-09-12T10:00:00.000Z',
          },
        ],
      ]),
    };
    const monthStart = new Date('2026-09-01T00:00:00.000Z');
    const monthEnd = new Date('2026-10-01T00:00:00.000Z');

    const result = await findMonthlyFeaturedProduct(executor, monthStart, monthEnd);

    expect(result).toMatchObject({ id: 7, name: 'Watch 7', price: 250, sold_quantity: 8 });
    expect(executor.execute).toHaveBeenCalledWith(
      expect.stringContaining("o.status IN ('verified', 'processing', 'completed')"),
      [monthStart, monthEnd]
    );
  });

  test('returns null when the month has no valid sales', async () => {
    const executor = {
      execute: jest.fn().mockResolvedValueOnce([[]]),
    };

    await expect(
      findMonthlyFeaturedProduct(
        executor,
        new Date('2026-09-01T00:00:00.000Z'),
        new Date('2026-10-01T00:00:00.000Z')
      )
    ).resolves.toBeNull();
  });

  test('uses quantity, latest sale, and product id as deterministic ordering', async () => {
    const executor = {
      execute: jest.fn().mockResolvedValueOnce([[]]),
    };

    await findMonthlyFeaturedProduct(
      executor,
      new Date('2026-09-01T00:00:00.000Z'),
      new Date('2026-10-01T00:00:00.000Z')
    );

    const query = executor.execute.mock.calls[0][0];
    expect(query).toContain('SUM(oi.quantity)');
    expect(query).toContain('ORDER BY sold_quantity DESC, latest_sale_at DESC, p.id ASC');
  });
});
