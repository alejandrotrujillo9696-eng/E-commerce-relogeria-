import { Router } from 'express';
import { addItem, getCart, mergeCart, removeItem, updateItem } from '../controllers/cartController.js';

const router = Router();

router.get('/', getCart);
router.post('/items', addItem);
router.patch('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);
router.post('/merge', mergeCart);

export default router;
