import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { teamService } from './team.service';

export const createTeam = asyncHandler(async (req, res) => {
  const team = await teamService.create(req.params.workspaceId!, req.user.id, req.body);
  sendSuccess(res, { team }, 201, 'Team created successfully');
});

export const getWorkspaceTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.getByWorkspace(req.params.workspaceId!, req.user.id);
  sendSuccess(res, { teams });
});

export const getUserTeams = asyncHandler(async (req, res) => {
  const teams = await teamService.getUserTeams(req.params.workspaceId!, req.user.id);
  sendSuccess(res, { teams });
});
