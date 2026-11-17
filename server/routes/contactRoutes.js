import { Router } from 'express';
import * as c from '../controllers/contactController.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router();
router.post('/', optionalAuth, c.create); // public: anyone can send a message
router.get('/', requireAuth, c.list); // admin: all, user: own
router.get('/:id', requireAuth, c.get);
router.put('/:id', requireAuth, requireAdmin, c.update);
router.delete('/:id', requireAuth, requireAdmin, c.remove);
export default router;