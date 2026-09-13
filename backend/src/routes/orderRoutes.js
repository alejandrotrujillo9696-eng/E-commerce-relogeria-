import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { cancelOrder, createOrder, deleteOrder, getOrder, listOrders } from '../controllers/orderController.js';

const router = Router();

router.use(authenticate);
router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:orderId', getOrder);
router.patch('/:orderId/cancel', cancelOrder);
router.delete('/:orderId', deleteOrder);

export default router;
