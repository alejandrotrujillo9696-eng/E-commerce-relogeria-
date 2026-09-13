import { Router } from 'express';
import { getCategories, getProductById, getProducts } from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:productId', getProductById);

export default router;
