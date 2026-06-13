import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@/shared/errors/AppError';
import { ErrorCodes } from '@/shared/errors/errorCodes';

vi.mock('@/resources/workspaces/workspace.query', () => ({
  workspaceQuery: {
    findBySlug: vi.fn(),
    create: vi.fn(),
    getUser: vi.fn(),
    setUserLastActiveWorkspace: vi.fn(),
    findById: vi.fn(),
    findByIdForUser: vi.fn(),
    createInvitation: vi.fn(),
  },
}));

vi.mock('@/resources/teams/team.query', () => ({
  teamQuery: {
    findUserByEmail: vi.fn(),
    getUserName: vi.fn(),
    findMemberInWorkspace: vi.fn(),
    findOrCreateDefaultTeam: vi.fn(),
    createMember: vi.fn(),
  },
}));

vi.mock('@/shared/utils/email', () => ({
  sendEmail: vi.fn(),
}));

import { workspaceService } from '@/resources/workspaces/workspace.service';
import { workspaceQuery } from '@/resources/workspaces/workspace.query';
import { teamQuery } from '@/resources/teams/team.query';
import { sendEmail } from '@/shared/utils/email';

describe('workspaceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('rejects invalid slug', async () => {
      await expect(workspaceService.create('Acme', 'a', 'user-1')).rejects.toMatchObject({
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
      });
    });

    it('rejects taken slug', async () => {
      vi.mocked(workspaceQuery.findBySlug).mockResolvedValue({ id: 'workspace-1' } as never);

      await expect(workspaceService.create('Acme', 'acme', 'user-1')).rejects.toMatchObject({
        code: ErrorCodes.SLUG_TAKEN,
        statusCode: 409,
      });
    });

    it('creates workspace with cleaned slug', async () => {
      const workspace = { id: 'workspace-1', name: 'Acme', slug: 'acme' };
      vi.mocked(workspaceQuery.findBySlug).mockResolvedValue(null);
      vi.mocked(workspaceQuery.create).mockResolvedValue(workspace as never);
      vi.mocked(workspaceQuery.getUser).mockResolvedValue({ lastActiveWorkspaceId: null } as never);

      const result = await workspaceService.create('Acme', 'acme', 'user-1');

      expect(result.slug).toBe('acme');
      expect(workspaceQuery.setUserLastActiveWorkspace).toHaveBeenCalledWith('user-1', 'workspace-1');
    });
  });

  describe('inviteMember', () => {
    it('rejects invalid email', async () => {
      await expect(
        workspaceService.inviteMember('workspace-1', 'bad-email', 'user-1'),
      ).rejects.toMatchObject({
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
      });
    });

    it('rejects when workspace does not exist', async () => {
      vi.mocked(workspaceQuery.findById).mockResolvedValue(null);

      await expect(
        workspaceService.inviteMember('workspace-1', 'user@example.com', 'user-1'),
      ).rejects.toMatchObject({
        code: ErrorCodes.WORKSPACE_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('rejects when user is already a member', async () => {
      vi.mocked(workspaceQuery.findById).mockResolvedValue({ id: 'workspace-1', name: 'Acme' } as never);
      vi.mocked(teamQuery.findUserByEmail).mockResolvedValue({ id: 'user-2' } as never);
      vi.mocked(teamQuery.getUserName).mockResolvedValue('Alice');
      vi.mocked(teamQuery.findMemberInWorkspace).mockResolvedValue({ id: 'member-1' } as never);

      await expect(
        workspaceService.inviteMember('workspace-1', 'user@example.com', 'user-1'),
      ).rejects.toMatchObject({
        code: ErrorCodes.MEMBER_ALREADY_EXISTS,
        statusCode: 400,
      });
    });

    it('adds existing user to default team and sends email', async () => {
      vi.mocked(workspaceQuery.findById).mockResolvedValue({ id: 'workspace-1', name: 'Acme' } as never);
      vi.mocked(teamQuery.findUserByEmail).mockResolvedValue({ id: 'user-2' } as never);
      vi.mocked(teamQuery.getUserName).mockResolvedValue('Alice');
      vi.mocked(teamQuery.findMemberInWorkspace).mockResolvedValue(null);
      vi.mocked(teamQuery.findOrCreateDefaultTeam).mockResolvedValue({ id: 'team-1' } as never);

      const result = await workspaceService.inviteMember('workspace-1', 'user@example.com', 'user-1');

      expect(result.workspace_name).toBe('Acme');
      expect(teamQuery.createMember).toHaveBeenCalledOnce();
      expect(sendEmail).toHaveBeenCalledOnce();
    });
  });

  describe('checkSlugAvailability', () => {
    it('returns unavailable when slug exists', async () => {
      vi.mocked(workspaceQuery.findBySlug).mockResolvedValue({ id: 'workspace-1' } as never);

      const result = await workspaceService.checkSlugAvailability('acme');

      expect(result).toEqual({ available: false, slug: 'acme' });
    });

    it('returns available when slug is free', async () => {
      vi.mocked(workspaceQuery.findBySlug).mockResolvedValue(null);

      const result = await workspaceService.checkSlugAvailability('new-team');

      expect(result).toEqual({ available: true, slug: 'new-team' });
    });

    it('rejects empty slug parameter', async () => {
      await expect(workspaceService.checkSlugAvailability('')).rejects.toMatchObject({
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
      });
    });

    it('rejects slug shorter than 3 characters after cleaning', async () => {
      await expect(workspaceService.checkSlugAvailability('ab')).rejects.toMatchObject({
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
        message: 'Workspace URL must be at least 3 characters long',
      });
    });
  });

  describe('getDetails', () => {
    it('throws when workspace is not found or inaccessible', async () => {
      vi.mocked(workspaceQuery.findByIdForUser).mockResolvedValue(null);

      await expect(workspaceService.getDetails('workspace-1', 'user-1')).rejects.toMatchObject({
        code: ErrorCodes.WORKSPACE_NOT_FOUND,
        statusCode: 404,
      });
    });

    it('returns admin role for workspace creator', async () => {
      vi.mocked(workspaceQuery.findByIdForUser).mockResolvedValue({
        id: 'workspace-1',
        name: 'Acme',
        slug: 'acme',
        createdAt: new Date('2024-01-01'),
        creatorId: 'user-1',
        teams: [],
      } as never);

      const result = await workspaceService.getDetails('workspace-1', 'user-1');

      expect(result.role).toBe('admin');
    });

    it('returns team member role for non-creator members', async () => {
      vi.mocked(workspaceQuery.findByIdForUser).mockResolvedValue({
        id: 'workspace-1',
        name: 'Acme',
        slug: 'acme',
        createdAt: new Date('2024-01-01'),
        creatorId: 'creator-1',
        teams: [{ members: [{ role: 'member' }] }],
      } as never);

      const result = await workspaceService.getDetails('workspace-1', 'user-2');

      expect(result.role).toBe('member');
    });
  });

  describe('setActiveWorkspace', () => {
    it('updates last active workspace when user is a member', async () => {
      vi.mocked(teamQuery.findMemberInWorkspace).mockResolvedValue({ id: 'member-1' } as never);

      await workspaceService.setActiveWorkspace('user-1', 'workspace-1');

      expect(workspaceQuery.setUserLastActiveWorkspace).toHaveBeenCalledWith('user-1', 'workspace-1');
    });

    it('rejects when user is not a member', async () => {
      vi.mocked(teamQuery.findMemberInWorkspace).mockResolvedValue(null);

      await expect(
        workspaceService.setActiveWorkspace('user-1', 'workspace-1'),
      ).rejects.toMatchObject({
        code: ErrorCodes.WORKSPACE_NOT_FOUND,
        statusCode: 404,
      });
    });
  });

  describe('inviteMember (new user)', () => {
    it('creates invitation when email is not registered', async () => {
      vi.mocked(workspaceQuery.findById).mockResolvedValue({ id: 'workspace-1', name: 'Acme' } as never);
      vi.mocked(teamQuery.findUserByEmail).mockResolvedValue(null);
      vi.mocked(teamQuery.getUserName).mockResolvedValue('Alice');

      const result = await workspaceService.inviteMember('workspace-1', 'new@example.com', 'user-1');

      expect(workspaceQuery.createInvitation).toHaveBeenCalledWith('new@example.com', 'workspace-1');
      expect(sendEmail).toHaveBeenCalledOnce();
      expect(result.workspace_name).toBe('Acme');
    });
  });
});
