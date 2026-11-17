import { Router } from 'express';
import * as c from '../controllers/userController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin); // every user-management route is admin-only
router.get('/', c.list);
router.get('/:id', c.get);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;