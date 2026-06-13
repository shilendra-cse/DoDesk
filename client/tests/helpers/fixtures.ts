import { Issue } from '@/types/issue';
import { Workspace } from '@/types/workspace';

export function buildWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  return {
    id: 'workspace-1',
    name: 'Acme',
    slug: 'acme',
    teams: [],
    ...overrides,
  };
}

export function buildIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: 'issue-1',
    title: 'Fix login bug',
    state: 'todo',
    priority: 2,
    labels: [],
    number: 1,
    workspaceId: 'workspace-1',
    teamId: 'team-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    issueKey: 'ENG-1',
    ...overrides,
  };
}
