import { describe, test, expect, jest } from '@jest/globals';
import { findCategories } from '../src/models/productModel.js';

describe('Category model', () => {
  test('findCategories no usa INNER JOIN con products', async () => {
    const rows = [{ id: 1, name: 'Test' }];
    const executor = {
      execute: jest.fn().mockResolvedValue([rows]),
    };

    const result = await findCategories(executor);

    expect(result).toEqual(rows);
    expect(executor.execute).toHaveBeenCalledTimes(1);
    const query = executor.execute.mock.calls[0][0];
    expect(query).not.toMatch(/INNER JOIN products/i);
    expect(query).toMatch(/FROM categories c/i);
  });
});
