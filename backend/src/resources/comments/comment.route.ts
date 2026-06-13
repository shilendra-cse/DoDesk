import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from './comment.controller';
import {
  issueIdParamsSchema,
  createCommentSchema,
  updateCommentSchema,
  commentIdParamsSchema,
} from './comment.schema';

const router = Router();

router.get('/issues/:issueId/comments', requireAuth, validate(issueIdParamsSchema), getComments);
router.post('/issues/:issueId/comments', requireAuth, validate(createCommentSchema), createComment);
router.put('/comments/:commentId', requireAuth, validate(updateCommentSchema), updateComment);
router.delete('/comments/:commentId', requireAuth, validate(commentIdParamsSchema), deleteComment);

export default router;
