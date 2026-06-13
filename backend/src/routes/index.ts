import { Router } from 'express';
import issueRouter from '../resources/issues/issue.route';
import workspaceRouter from '../resources/workspaces/workspace.route';
import teamRouter from '../resources/teams/team.route';
import commentRouter from '../resources/comments/comment.route';
import filterRouter from '../resources/filters/filter.route';
import userRouter from '../resources/users/user.route';

const router = Router();

router.use(issueRouter);
router.use(workspaceRouter);
router.use(teamRouter);
router.use(commentRouter);
router.use(filterRouter);
router.use(userRouter);

export default router;
