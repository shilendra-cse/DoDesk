import type { IssueWithRelations, IssueWithMinimalRelations } from '@/resources/issues/issue.types';
import type { TeamWithMembers } from '@/resources/teams/team.types';

const now = new Date('2025-01-15T10:00:00Z');

export function buildIssueWithRelations(overrides: Partial<IssueWithRelations> = {}): IssueWithRelations {
  return {
    id: 'issue-1',
    title: 'Fix login bug',
    description: 'Users cannot sign in',
    state: 'todo',
    priority: 2,
    labels: ['bug'],
    dueDate: null,
    notes: null,
    number: 42,
    workspaceId: 'workspace-1',
    teamId: 'team-1',
    assigneeId: 'user-2',
    creatorId: 'user-1',
    createdAt: now,
    updatedAt: now,
    creator: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
    assignee: { id: 'user-2', name: 'Bob', email: 'bob@example.com' },
    team: { key: 'ENG', name: 'Engineering', color: '#6B7280' },
    _count: { comments: 3 },
    ...overrides,
  };
}

export function buildIssueWithMinimalRelations(
  overrides: Partial<IssueWithMinimalRelations> = {},
): IssueWithMinimalRelations {
  return {
    id: 'issue-1',
    title: 'Fix login bug',
    description: null,
    state: 'todo',
    priority: 2,
    labels: [],
    dueDate: null,
    notes: null,
    number: 7,
    workspaceId: 'workspace-1',
    teamId: 'team-1',
    assigneeId: null,
    creatorId: 'user-1',
    createdAt: now,
    updatedAt: now,
    creator: { name: 'Alice' },
    assignee: { name: null },
    team: { key: 'DES', name: 'Design' },
    ...overrides,
  };
}

export function buildTeamWithMembers(overrides: Partial<TeamWithMembers> = {}): TeamWithMembers {
  return {
    id: 'team-1',
    name: 'Engineering',
    key: 'ENG',
    description: null,
    color: '#6B7280',
    workspaceId: 'workspace-1',
    creatorId: 'user-1',
    createdAt: now,
    updatedAt: now,
    members: [
      {
        id: 'member-1',
        userId: 'user-1',
        teamId: 'team-1',
        role: 'admin',
        joinedAt: now,
        updatedAt: now,
        user: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
      },
      {
        id: 'member-2',
        userId: 'user-2',
        teamId: 'team-1',
        role: 'member',
        joinedAt: now,
        updatedAt: now,
        user: { id: 'user-2', name: 'Bob', email: 'bob@example.com' },
      },
    ],
    _count: { members: 2 },
    ...overrides,
  };
}
