import { describe, it, expect } from 'vitest';
import { formatWorkspaceTeam, formatUserTeam } from '@/resources/teams/team.types';
import { buildTeamWithMembers } from '../../../helpers/fixtures';

describe('formatWorkspaceTeam', () => {
  it('adds member_count and is_member for the requesting user', () => {
    const team = buildTeamWithMembers();

    const formatted = formatWorkspaceTeam(team, 'user-1');

    expect(formatted.member_count).toBe(2);
    expect(formatted.is_member).toBe(true);
  });

  it('sets is_member false when user is not on the team', () => {
    const team = buildTeamWithMembers();

    const formatted = formatWorkspaceTeam(team, 'user-unknown');

    expect(formatted.is_member).toBe(false);
  });

  it('transforms member user shape', () => {
    const team = buildTeamWithMembers();

    const formatted = formatWorkspaceTeam(team, 'user-1');

    expect(formatted.members[0]).toEqual({
      id: 'member-1',
      userId: 'user-1',
      teamId: 'team-1',
      role: 'admin',
      joinedAt: team.members[0]!.joinedAt,
      updatedAt: team.members[0]!.updatedAt,
      user: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
    });
  });
});

describe('formatUserTeam', () => {
  it('uses the member role and joined_at when present', () => {
    const joinedAt = new Date('2025-06-01T00:00:00Z');
    const team = {
      id: 'team-1',
      name: 'Engineering',
      key: 'ENG',
      description: null,
      color: '#6B7280',
      workspaceId: 'workspace-1',
      creatorId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [{ role: 'admin', joinedAt }],
    };

    const formatted = formatUserTeam(team);

    expect(formatted.role).toBe('admin');
    expect(formatted.joined_at).toBe(joinedAt);
  });

  it('defaults role and joined_at when member is missing', () => {
    const team = {
      id: 'team-1',
      name: 'Engineering',
      key: 'ENG',
      description: null,
      color: '#6B7280',
      workspaceId: 'workspace-1',
      creatorId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [],
    };

    const formatted = formatUserTeam(team);

    expect(formatted.role).toBe('member');
    expect(formatted.joined_at).toBeInstanceOf(Date);
  });
});
