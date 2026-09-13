import * as authController from '../src/controllers/authController.js';
import * as productController from '../src/controllers/productController.js';
import * as cartController from '../src/controllers/cartController.js';
import * as orderController from '../src/controllers/orderController.js';
import * as adminController from '../src/controllers/adminController.js';
import * as adminDashboardController from '../src/controllers/adminDashboardController.js';

describe('Backend controllers exports', () => {
  test('authController exports register, login, logout, me', () => {
    expect(typeof authController.register).toBe('function');
    expect(typeof authController.login).toBe('function');
    expect(typeof authController.logout).toBe('function');
    expect(typeof authController.me).toBe('function');
  });

  test('productController exports getProducts, getProductById, getCategories', () => {
    expect(typeof productController.getProducts).toBe('function');
    expect(typeof productController.getProductById).toBe('function');
    expect(typeof productController.getCategories).toBe('function');
  });

  test('cartController exports getCart, addItem, updateItem, removeItem, mergeCart', () => {
    expect(typeof cartController.getCart).toBe('function');
    expect(typeof cartController.addItem).toBe('function');
    expect(typeof cartController.updateItem).toBe('function');
    expect(typeof cartController.removeItem).toBe('function');
    expect(typeof cartController.mergeCart).toBe('function');
  });

  test('orderController exports createOrder, getOrder, listOrders', () => {
    expect(typeof orderController.createOrder).toBe('function');
    expect(typeof orderController.getOrder).toBe('function');
    expect(typeof orderController.listOrders).toBe('function');
  });

  test('adminController exports CRUD functions', () => {
    expect(typeof adminController.createProduct).toBe('function');
    expect(typeof adminController.updateProduct).toBe('function');
    expect(typeof adminController.deleteProduct).toBe('function');
    expect(typeof adminController.createCategory).toBe('function');
    expect(typeof adminController.updateCategory).toBe('function');
    expect(typeof adminController.deleteCategory).toBe('function');
    expect(typeof adminController.listUsers).toBe('function');
    expect(typeof adminController.updateUserRole).toBe('function');
    expect(typeof adminController.deleteUser).toBe('function');
    expect(typeof adminController.listOrders).toBe('function');
    expect(typeof adminController.getOrder).toBe('function');
  });

  test('adminDashboardController exports dashboard handlers', () => {
    expect(typeof adminDashboardController.getDashboard).toBe('function');
    expect(typeof adminDashboardController.getDashboardSalesHandler).toBe('function');
    expect(typeof adminDashboardController.getDashboardOrdersByStatusHandler).toBe('function');
    expect(typeof adminDashboardController.getDashboardProductsSummaryHandler).toBe('function');
    expect(typeof adminDashboardController.getDashboardRecentOrdersHandler).toBe('function');
    expect(typeof adminDashboardController.getDashboardRecentUsersHandler).toBe('function');
    expect(typeof adminDashboardController.getDashboardTopProductsHandler).toBe('function');
    expect(typeof adminDashboardController.getDashboardSalesByCategoryHandler).toBe('function');
  });
});
