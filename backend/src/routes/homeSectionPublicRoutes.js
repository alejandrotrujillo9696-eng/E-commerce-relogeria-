import { Router } from 'express';
import {
	getHomeSection,
	getMonthlyFeaturedProduct,
} from '../controllers/homeSectionController.js';

const router = Router();

router.get('/', getHomeSection);
router.get('/featured', getMonthlyFeaturedProduct);

export default router;
