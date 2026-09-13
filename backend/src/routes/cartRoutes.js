import { Router } from 'express';
import { addItem, getCart, mergeCart, removeItem, updateItem } from '../controllers/cartController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);
router.post('/merge', mergeCart);

export default router;
