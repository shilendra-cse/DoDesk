import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { workspaceService } from './workspace.service';

export const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.create(
    req.body.name,
    req.body.slug,
    req.user.id,
  );
  sendSuccess(res, { workspace }, 201, 'Workspace successfully created');
});

export const getUserWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await workspaceService.listForUser(req.user.id);
  sendSuccess(res, { workspaces });
});

export const inviteMember = asyncHandler(async (req, res) => {
  const result = await workspaceService.inviteMember(
    req.params.workspaceId!,
    req.body.email,
    req.user.id,
  );
  sendSuccess(res, result, 200, 'Invitation successfully sent');
});

export const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const members = await workspaceService.getMembers(req.params.workspaceId!);
  sendSuccess(res, { members });
});

export const getUniqueWorkspaceMembers = asyncHandler(async (req, res) => {
  const members = await workspaceService.getUniqueMembers(req.params.workspaceId!);
  sendSuccess(res, { members });
});

export const setActiveWorkspace = asyncHandler(async (req, res) => {
  await workspaceService.setActiveWorkspace(req.user.id, req.body.workspaceId);
  sendSuccess(res, {}, 200, 'Last active workspace set successfully');
});

export const getWorkspaceDetails = asyncHandler(async (req, res) => {
  const workspace = await workspaceService.getDetails(req.params.workspaceId!, req.user.id);
  sendSuccess(res, { workspace });
});

export const checkSlugAvailability = asyncHandler(async (req, res) => {
  const result = await workspaceService.checkSlugAvailability(req.params.slug!);
  sendSuccess(res, result, 200, 'Slug availability checked');
});
