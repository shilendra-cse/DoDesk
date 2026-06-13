import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/db/prisma', () => ({
  default: {
    user: { findUnique: vi.fn() },
    team: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

import prisma from '@/shared/db/prisma';
import { teamQuery } from '@/resources/teams/team.query';

describe('teamQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserName', () => {
    it('returns empty string when user is not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const name = await teamQuery.getUserName('missing-user');

      expect(name).toBe('');
    });
  });

  describe('findOrCreateDefaultTeam', () => {
    it('returns existing GEN team when one already exists', async () => {
      const existing = { id: 'team-gen', key: 'GEN', workspaceId: 'workspace-1' };
      vi.mocked(prisma.team.findFirst).mockResolvedValue(existing as never);

      const result = await teamQuery.findOrCreateDefaultTeam('workspace-1');

      expect(result).toEqual(existing);
      expect(prisma.team.create).not.toHaveBeenCalled();
    });

    it('creates GEN team when none exists', async () => {
      const created = { id: 'team-new', key: 'GEN', workspaceId: 'workspace-1' };
      vi.mocked(prisma.team.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.team.create).mockResolvedValue(created as never);

      const result = await teamQuery.findOrCreateDefaultTeam('workspace-1');

      expect(result).toEqual(created);
      expect(prisma.team.create).toHaveBeenCalledOnce();
    });
  });
});
