import { Router } from 'express';
import c from '../controllers/qualificationController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', requireAuth, requireAdmin, c.create);
router.put('/:id', requireAuth, requireAdmin, c.update);
router.delete('/:id', requireAuth, requireAdmin, c.remove);
export default router;