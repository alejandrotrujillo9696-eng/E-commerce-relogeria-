import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import * as adminController from '../controllers/adminController.js';
import {
  getDashboard,
  getDashboardSalesByCategoryHandler,
  getDashboardSalesHandler,
  getDashboardOrdersByStatusHandler,
  getDashboardProductsSummaryHandler,
  getDashboardRecentOrdersHandler,
  getDashboardRecentUsersHandler,
  getDashboardTopProductsHandler,
} from '../controllers/adminDashboardController.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', getDashboard);
router.get('/dashboard/sales', getDashboardSalesHandler);
router.get('/dashboard/orders-by-status', getDashboardOrdersByStatusHandler);
router.get('/dashboard/products-summary', getDashboardProductsSummaryHandler);
router.get('/dashboard/recent-orders', getDashboardRecentOrdersHandler);
router.get('/dashboard/recent-users', getDashboardRecentUsersHandler);
router.get('/dashboard/top-products', getDashboardTopProductsHandler);
router.get('/dashboard/sales-by-category', getDashboardSalesByCategoryHandler);

router.post('/products', adminController.createProduct);
router.put('/products/:productId', adminController.updateProduct);
router.delete('/products/:productId', adminController.deleteProduct);

router.post('/categories', adminController.createCategory);
router.put('/categories/:categoryId', adminController.updateCategory);
router.delete('/categories/:categoryId', adminController.deleteCategory);

router.get('/users', adminController.listUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

router.get('/orders', adminController.listOrders);
router.get('/orders/:orderId', adminController.getOrder);
router.patch('/orders/:orderId/status', adminController.updateOrderStatus);
router.delete('/orders/:orderId', adminController.deleteOrder);

export default router;
