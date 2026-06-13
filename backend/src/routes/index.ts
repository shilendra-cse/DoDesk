import { Router } from 'express';
import issueRouter from '../resources/issues/issue.route';

const router = Router();

router.use(issueRouter);

export default router;
