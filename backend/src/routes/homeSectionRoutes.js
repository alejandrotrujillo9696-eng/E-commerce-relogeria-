import { Router } from 'express';
import {
  addHomeSectionItem,
  getHomeSection,
  removeHomeSectionItem,
  replaceHomeSectionItems,
  updateHomeSectionItemOrder,
  updateHomeSectionTitle,
} from '../controllers/homeSectionController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/', getHomeSection);
router.put('/title', updateHomeSectionTitle);
router.post('/items', addHomeSectionItem);
router.delete('/items/:itemId', removeHomeSectionItem);
router.patch('/items/:itemId/order', updateHomeSectionItemOrder);
router.put('/items', replaceHomeSectionItems);

export default router;
