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

export function buildTeam(overrides: Partial<import('@/types/workspace').Team> = {}) {
  return {
    id: 'team-1',
    name: 'Engineering',
    key: 'ENG',
    color: '#000',
    members: [],
    ...overrides,
  };
}

export function buildSavedFilter(overrides: Partial<import('@/types/filter').SavedFilter> = {}) {
  return {
    id: 'filter-1',
    name: 'My view',
    filter_config: { stateFilter: 'todo' },
    is_default: false,
    user_id: 'user-1',
    workspace_id: 'workspace-1',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function buildComment(overrides: Partial<import('@/services/commentService').Comment> = {}) {
  return {
    id: 'comment-1',
    content: 'Looks good',
    issueId: 'issue-1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}
