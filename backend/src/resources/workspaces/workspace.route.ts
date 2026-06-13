import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import {
  createWorkspace,
  getUserWorkspaces,
  inviteMember,
  getWorkspaceMembers,
  getUniqueWorkspaceMembers,
  setActiveWorkspace,
  getWorkspaceDetails,
  checkSlugAvailability,
} from './workspace.controller';
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  setActiveWorkspaceSchema,
  workspaceIdParamsSchema,
  slugParamsSchema,
} from './workspace.schema';

const router = Router();

router.post('/workspaces', requireAuth, validate(createWorkspaceSchema), createWorkspace);
router.get('/workspaces', requireAuth, getUserWorkspaces);
router.get('/workspaces/check-slug/:slug', requireAuth, validate(slugParamsSchema), checkSlugAvailability);
router.get('/workspaces/:workspaceId/details', requireAuth, validate(workspaceIdParamsSchema), getWorkspaceDetails);
router.post('/workspaces/:workspaceId/invite', requireAuth, validate(inviteMemberSchema), inviteMember);
router.get('/workspaces/:workspaceId/members', requireAuth, validate(workspaceIdParamsSchema), getWorkspaceMembers);
router.get('/workspaces/:workspaceId/members/unique', requireAuth, validate(workspaceIdParamsSchema), getUniqueWorkspaceMembers);
router.patch('/users/me/active-workspace', requireAuth, validate(setActiveWorkspaceSchema), setActiveWorkspace);

export default router;
