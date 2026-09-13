import { Router } from 'express';
import { getHomeSection } from '../controllers/homeSectionController.js';

const router = Router();

router.get('/', getHomeSection);

export default router;
