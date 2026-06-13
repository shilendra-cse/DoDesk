import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import {
  createIssue,
  getIssueById,
  getIssuesByWorkspace,
  getIssuesByTeam,
  updateIssue,
  deleteIssue,
} from './issue.controller';
import { createIssueSchema, updateIssueSchema } from './issue.schema';

const router = Router();

router.post('/teams/:teamId/issues', requireAuth, validate(createIssueSchema), createIssue);
router.get('/workspaces/:workspaceId/issues', requireAuth, getIssuesByWorkspace);
router.get('/teams/:teamId/issues', requireAuth, getIssuesByTeam);
router.get('/issues/:issueId', requireAuth, getIssueById);
router.put('/issues/:issueId', requireAuth, validate(updateIssueSchema), updateIssue);
router.delete('/issues/:issueId', requireAuth, deleteIssue);

export default router;
