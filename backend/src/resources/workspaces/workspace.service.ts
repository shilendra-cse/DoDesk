import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../shared/errors/errorCodes';
import { cleanSlug, validateSlugInput } from '../../shared/utils/slug';
import { isValidEmail } from '../../shared/utils/isValidEmail';
import { sendEmail } from '../../shared/utils/email';
import { workspaceQuery } from './workspace.query';
import { teamQuery } from '../teams/team.query';
import {
  formatTeamMember,
  formatWorkspaceMember,
  WorkspaceDetailsDto,
} from './workspace.types';

export const workspaceService = {
  async create(name: string, slug: string, userId: string) {
    const { clean, error } = validateSlugInput(slug);
    if (error) throw new AppError(ErrorCodes.VALIDATION_ERROR, 400, error);

    const existing = await workspaceQuery.findBySlug(clean);
    if (existing) {
      throw new AppError(
        ErrorCodes.SLUG_TAKEN,
        409,
        'This workspace URL is already taken. Please choose a different one.',
      );
    }

    const workspace = await workspaceQuery.create({
      name,
      slug: clean,
      creatorId: userId,
    });

    const user = await workspaceQuery.getUser(userId);
    if (!user?.lastActiveWorkspaceId) {
      await workspaceQuery.setUserLastActiveWorkspace(userId, workspace.id);
    }

    return workspace;
  },

  async listForUser(userId: string) {
    return workspaceQuery.findAllForUser(userId);
  },

  async inviteMember(workspaceId: string, email: string, inviterId: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 400, 'Invalid email address');
    }

    const workspace = await workspaceQuery.findById(workspaceId);
    if (!workspace) {
      throw new AppError(ErrorCodes.WORKSPACE_NOT_FOUND, 404, 'Workspace not found');
    }

    const existingUser = await teamQuery.findUserByEmail(normalizedEmail);
    const inviterName = await teamQuery.getUserName(inviterId);

    if (existingUser) {
      const existingMember = await teamQuery.findMemberInWorkspace(
        existingUser.id,
        workspaceId,
      );

      if (existingMember) {
        throw new AppError(ErrorCodes.MEMBER_ALREADY_EXISTS, 400, 'User is already a member');
      }

      const defaultTeam = await teamQuery.findOrCreateDefaultTeam(workspaceId);

      await teamQuery.createMember({
        userId: existingUser.id,
        teamId: defaultTeam.id,
        role: 'member',
      });

      sendEmail(
        normalizedEmail,
        `You have been added to ${workspace.name}`,
        'Hey, you have been added to a new workspace.',
      );

      return {
        workspace_name: workspace.name,
        user_name: inviterName,
      };
    }

    await workspaceQuery.createInvitation(normalizedEmail, workspaceId);

    sendEmail(
      normalizedEmail,
      'You have been invited to a workspace',
      `Hey, you have been invited to a new workspace ${workspace.name}, please signup to join.`,
    );

    return {
      workspace_name: workspace.name,
      user_name: inviterName,
    };
  },

  async getMembers(workspaceId: string) {
    const members = await workspaceQuery.getMembers(workspaceId);
    return members.map(formatTeamMember);
  },

  async getUniqueMembers(workspaceId: string) {
    const users = await workspaceQuery.getUniqueMembers(workspaceId);
    return users.map(formatWorkspaceMember);
  },

  async setActiveWorkspace(userId: string, workspaceId: string) {
    const membership = await teamQuery.findMemberInWorkspace(userId, workspaceId);

    if (!membership) {
      throw new AppError(
        ErrorCodes.WORKSPACE_NOT_FOUND,
        404,
        'Workspace not found or you are not a member',
      );
    }

    await workspaceQuery.setUserLastActiveWorkspace(userId, workspaceId);
  },

  async getDetails(workspaceId: string, userId: string): Promise<WorkspaceDetailsDto> {
    const workspace = await workspaceQuery.findByIdForUser(workspaceId, userId);

    if (!workspace) {
      throw new AppError(
        ErrorCodes.WORKSPACE_NOT_FOUND,
        404,
        "Workspace not found or you don't have access",
      );
    }

    let role = 'member';
    if (workspace.creatorId === userId) {
      role = 'admin';
    } else if (workspace.teams.length > 0 && workspace.teams[0]?.members.length) {
      role = workspace.teams[0].members[0]?.role || 'member';
    }

    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      createdAt: workspace.createdAt,
      created_by: workspace.creatorId,
      role,
    };
  },

  async checkSlugAvailability(slug: string) {
    const clean = cleanSlug(slug);

    if (!slug) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 400, 'Slug parameter is required');
    }

    if (clean.length < 3) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        400,
        'Workspace URL must be at least 3 characters long',
      );
    }

    const existing = await workspaceQuery.findBySlug(clean);
    return { available: !existing, slug: clean };
  },
};
