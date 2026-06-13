import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { filterService } from './filter.service';

export const getSavedFilters = asyncHandler(async (req, res) => {
  const filters = await filterService.list(req.user.id, req.params.workspaceId!);
  sendSuccess(res, { filters });
});

export const getDefaultFilter = asyncHandler(async (req, res) => {
  const filter = await filterService.getDefault(req.user.id, req.params.workspaceId!);
  sendSuccess(res, { filter });
});

export const createSavedFilter = asyncHandler(async (req, res) => {
  const filter = await filterService.create(req.user.id, req.params.workspaceId!, req.body);
  sendSuccess(res, { filter }, 201, 'Saved filter created successfully');
});

export const updateSavedFilter = asyncHandler(async (req, res) => {
  const filter = await filterService.update(req.user.id, req.params.filterId!, req.body);
  sendSuccess(res, { filter }, 200, 'Saved filter updated successfully');
});

export const deleteSavedFilter = asyncHandler(async (req, res) => {
  await filterService.delete(req.user.id, req.params.filterId!);
  sendSuccess(res, {}, 200, 'Saved filter deleted successfully');
});
