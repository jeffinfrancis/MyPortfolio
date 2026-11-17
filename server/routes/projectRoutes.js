import { Router } from 'express';
import c from '../controllers/projectController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
// Anyone can read the portfolio; only an admin can change it.
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', requireAuth, requireAdmin, c.create);
router.put('/:id', requireAuth, requireAdmin, c.update);
router.delete('/:id', requireAuth, requireAdmin, c.remove);
export default router;