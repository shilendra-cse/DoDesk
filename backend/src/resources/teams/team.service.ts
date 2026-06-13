import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../shared/errors/errorCodes';
import { teamQuery } from './team.query';
import { formatUserTeam, formatWorkspaceTeam } from './team.types';

export const teamService = {
  async create(
    workspaceId: string,
    userId: string,
    input: { name: string; key: string; description?: string; color?: string },
  ) {
    const key = input.key.toUpperCase();

    if (!/^[A-Z]{2,10}$/.test(key)) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        400,
        'Team key must be 2-10 uppercase letters',
      );
    }

    const admin = await teamQuery.findAdminInWorkspace(userId, workspaceId);
    if (!admin) {
      throw new AppError(ErrorCodes.FORBIDDEN, 403, 'Only workspace admins can create teams');
    }

    const team = await teamQuery.create({
      workspaceId,
      name: input.name,
      key,
      description: input.description ?? null,
      color: input.color || '#6B7280',
      creatorId: userId,
      userId,
    });

    return team;
  },

  async getByWorkspace(workspaceId: string, userId: string) {
    const member = await teamQuery.findMemberInWorkspace(userId, workspaceId);
    if (!member) {
      throw new AppError(
        ErrorCodes.FORBIDDEN,
        403,
        'You are not authorized to access this workspace',
      );
    }

    const teams = await teamQuery.findByWorkspace(workspaceId);
    return teams.map((team) => formatWorkspaceTeam(team, userId));
  },

  async getUserTeams(workspaceId: string, userId: string) {
    const teams = await teamQuery.findUserTeamsInWorkspace(workspaceId, userId);
    return teams
      .map(formatUserTeam)
      .sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime());
  },
};
