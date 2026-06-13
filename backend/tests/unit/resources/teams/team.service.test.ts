import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@/shared/errors/AppError';
import { ErrorCodes } from '@/shared/errors/errorCodes';
import { buildTeamWithMembers } from '../../../helpers/fixtures';

vi.mock('@/resources/teams/team.query', () => ({
  teamQuery: {
    findAdminInWorkspace: vi.fn(),
    create: vi.fn(),
    findMemberInWorkspace: vi.fn(),
    findByWorkspace: vi.fn(),
    findUserTeamsInWorkspace: vi.fn(),
  },
}));

import { teamService } from '@/resources/teams/team.service';
import { teamQuery } from '@/resources/teams/team.query';

describe('teamService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('rejects invalid team key format', async () => {
      await expect(
        teamService.create('workspace-1', 'user-1', { name: 'Eng', key: 'eng1' }),
      ).rejects.toMatchObject({
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
      });
    });

    it('rejects non-admin users', async () => {
      vi.mocked(teamQuery.findAdminInWorkspace).mockResolvedValue(null);

      await expect(
        teamService.create('workspace-1', 'user-1', { name: 'Engineering', key: 'ENG' }),
      ).rejects.toMatchObject({
        code: ErrorCodes.FORBIDDEN,
        statusCode: 403,
      });
    });

    it('creates team when user is admin', async () => {
      const createdTeam = { id: 'team-1', name: 'Engineering', key: 'ENG' };
      vi.mocked(teamQuery.findAdminInWorkspace).mockResolvedValue({ id: 'member-1' } as never);
      vi.mocked(teamQuery.create).mockResolvedValue(createdTeam as never);

      const result = await teamService.create('workspace-1', 'user-1', {
        name: 'Engineering',
        key: 'eng',
      });

      expect(result).toEqual(createdTeam);
      expect(teamQuery.create).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'ENG', workspaceId: 'workspace-1' }),
      );
    });
  });

  describe('getByWorkspace', () => {
    it('rejects users who are not workspace members', async () => {
      vi.mocked(teamQuery.findMemberInWorkspace).mockResolvedValue(null);

      await expect(teamService.getByWorkspace('workspace-1', 'user-1')).rejects.toMatchObject({
        code: ErrorCodes.FORBIDDEN,
        statusCode: 403,
      });
    });

    it('returns formatted teams for members', async () => {
      const team = buildTeamWithMembers();
      vi.mocked(teamQuery.findMemberInWorkspace).mockResolvedValue({ id: 'member-1' } as never);
      vi.mocked(teamQuery.findByWorkspace).mockResolvedValue([team]);

      const result = await teamService.getByWorkspace('workspace-1', 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0]?.member_count).toBe(2);
      expect(result[0]?.is_member).toBe(true);
    });
  });

  describe('getUserTeams', () => {
    it('returns teams sorted by joined date', async () => {
      const older = new Date('2024-01-01');
      const newer = new Date('2025-01-01');
      vi.mocked(teamQuery.findUserTeamsInWorkspace).mockResolvedValue([
        {
          id: 'team-1',
          name: 'Eng',
          key: 'ENG',
          members: [{ role: 'admin', joinedAt: older }],
        },
        {
          id: 'team-2',
          name: 'Design',
          key: 'DES',
          members: [{ role: 'member', joinedAt: newer }],
        },
      ] as never);

      const result = await teamService.getUserTeams('workspace-1', 'user-1');

      expect(result[0]?.id).toBe('team-2');
      expect(result[0]?.role).toBe('member');
    });
  });
});
