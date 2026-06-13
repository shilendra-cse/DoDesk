import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { getCurrentUser, getMe } from './user.controller';

const router = Router();

router.get('/users/me', requireAuth, getCurrentUser);

// Legacy alias — remove after client fully migrates
router.get('/auth/me', requireAuth, getMe);

export default router;
