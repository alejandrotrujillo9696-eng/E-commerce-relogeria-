import { listProducts, getProduct, listCategories } from '../src/services/productService.js';
import { createUserOrder, getUserOrder, getUserOrders } from '../src/services/orderService.js';
import { adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminListUsers, adminUpdateUserRole, adminDeleteUser, adminListOrders, adminGetOrder } from '../src/services/adminService.js';
import { createAuthToken } from '../src/services/authService.js';

describe('Backend services exports', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  test('productService exports required functions', () => {
    expect(typeof listProducts).toBe('function');
    expect(typeof getProduct).toBe('function');
    expect(typeof listCategories).toBe('function');
  });

  test('orderService exports required functions', () => {
    expect(typeof createUserOrder).toBe('function');
    expect(typeof getUserOrder).toBe('function');
    expect(typeof getUserOrders).toBe('function');
  });

  test('adminService exports required functions', () => {
    expect(typeof adminCreateProduct).toBe('function');
    expect(typeof adminUpdateProduct).toBe('function');
    expect(typeof adminDeleteProduct).toBe('function');
    expect(typeof adminCreateCategory).toBe('function');
    expect(typeof adminUpdateCategory).toBe('function');
    expect(typeof adminDeleteCategory).toBe('function');
    expect(typeof adminListUsers).toBe('function');
    expect(typeof adminUpdateUserRole).toBe('function');
    expect(typeof adminDeleteUser).toBe('function');
    expect(typeof adminListOrders).toBe('function');
    expect(typeof adminGetOrder).toBe('function');
  });

  test('authService createAuthToken generates a token', () => {
    const token = createAuthToken(1, 'customer');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});
