import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import { createTeam, getWorkspaceTeams, getUserTeams } from './team.controller';
import { createTeamSchema, workspaceIdParamsSchema } from './team.schema';

const router = Router();

router.post('/workspaces/:workspaceId/teams', requireAuth, validate(createTeamSchema), createTeam);
router.get('/workspaces/:workspaceId/teams', requireAuth, validate(workspaceIdParamsSchema), getWorkspaceTeams);
router.get('/workspaces/:workspaceId/teams/user', requireAuth, validate(workspaceIdParamsSchema), getUserTeams);

export default router;
