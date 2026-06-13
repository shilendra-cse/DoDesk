import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { getCurrentUser } from './user.controller';

const router = Router();

router.get('/users/me', requireAuth, getCurrentUser);

export default router;
