import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validate.middleware';
import {
  getSavedFilters,
  getDefaultFilter,
  createSavedFilter,
  updateSavedFilter,
  deleteSavedFilter,
} from './filter.controller';
import {
  workspaceIdParamsSchema,
  createFilterSchema,
  updateFilterSchema,
  filterIdParamsSchema,
} from './filter.schema';

const router = Router();

router.get('/workspaces/:workspaceId/filters', requireAuth, validate(workspaceIdParamsSchema), getSavedFilters);
router.get('/workspaces/:workspaceId/filters/default', requireAuth, validate(workspaceIdParamsSchema), getDefaultFilter);
router.post('/workspaces/:workspaceId/filters', requireAuth, validate(createFilterSchema), createSavedFilter);
router.put('/filters/:filterId', requireAuth, validate(updateFilterSchema), updateSavedFilter);
router.delete('/filters/:filterId', requireAuth, validate(filterIdParamsSchema), deleteSavedFilter);

export default router;
