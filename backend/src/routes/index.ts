import { Router } from 'express';
import issueRouter from '../resources/issues/issue.route';
import workspaceRouter from '../resources/workspaces/workspace.route';
import teamRouter from '../resources/teams/team.route';

const router = Router();

router.use(issueRouter);
router.use(workspaceRouter);
router.use(teamRouter);

export default router;
