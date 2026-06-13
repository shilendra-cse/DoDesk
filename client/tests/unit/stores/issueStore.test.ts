import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/issueService', () => ({
  issueService: {
    getIssuesByWorkspace: vi.fn(),
    getIssuesByTeam: vi.fn(),
    getIssueById: vi.fn(),
    createIssue: vi.fn(),
    updateIssue: vi.fn(),
    deleteIssue: vi.fn(),
    assignIssue: vi.fn(),
    updateNotes: vi.fn(),
  },
}));

import { issueService } from '@/services/issueService';
import { useIssueStore } from '@/stores/issueStore';
import { buildIssue } from '../../helpers/fixtures';

describe('useIssueStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useIssueStore.setState({
      issues: {},
      issueIds: [],
      selectedIssueId: null,
      selectedIssueDate: null,
      loadingStates: {},
      errors: {},
      lastFetched: null,
      isInitialized: false,
    });
  });

  it('fetchIssuesByWorkspace normalizes issues', async () => {
    const issues = [buildIssue({ id: 'issue-1' }), buildIssue({ id: 'issue-2', issueKey: 'ENG-2' })];
    vi.mocked(issueService.getIssuesByWorkspace).mockResolvedValue(issues);

    await useIssueStore.getState().fetchIssuesByWorkspace('workspace-1');

    const state = useIssueStore.getState();
    expect(state.issueIds).toEqual(['issue-1', 'issue-2']);
    expect(state.isInitialized).toBe(true);
    expect(state.getIssuesArray()).toHaveLength(2);
  });

  it('fetchIssuesByTeam handles errors', async () => {
    vi.mocked(issueService.getIssuesByTeam).mockRejectedValue(new Error('Failed'));

    await useIssueStore.getState().fetchIssuesByTeam('team-1');

    expect(useIssueStore.getState().errors.fetchIssuesByTeam).toBe('Failed to fetch issues');
  });

  it('fetchIssueById adds issue to store', async () => {
    const issue = buildIssue({ id: 'issue-3' });
    vi.mocked(issueService.getIssueById).mockResolvedValue(issue);

    const fetched = await useIssueStore.getState().fetchIssueById('issue-3');

    expect(fetched).toEqual(issue);
    expect(useIssueStore.getState().getIssueById('issue-3')).toEqual(issue);
  });

  it('createIssue prepends new issue', async () => {
    const issue = buildIssue({ id: 'issue-new' });
    vi.mocked(issueService.createIssue).mockResolvedValue(issue);

    const created = await useIssueStore.getState().createIssue({
      title: 'New',
      teamId: 'team-1',
      workspaceId: 'workspace-1',
    });

    expect(created).toEqual(issue);
    expect(useIssueStore.getState().issueIds[0]).toBe('issue-new');
  });

  it('updateIssue optimistically updates and reverts on failure', async () => {
    const issue = buildIssue({ id: 'issue-1', title: 'Original' });
    useIssueStore.setState({ issues: { 'issue-1': issue }, issueIds: ['issue-1'] });
    vi.mocked(issueService.updateIssue)
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce({ ...issue, title: 'Updated' });

    await useIssueStore.getState().updateIssue('issue-1', { title: 'Updated' });
    expect(useIssueStore.getState().issues['issue-1']?.title).toBe('Original');

    await useIssueStore.getState().updateIssue('issue-1', { title: 'Updated' });
    expect(useIssueStore.getState().issues['issue-1']?.title).toBe('Updated');
  });

  it('deleteIssue removes issue from store', async () => {
    useIssueStore.setState({
      issues: { 'issue-1': buildIssue() },
      issueIds: ['issue-1'],
    });
    vi.mocked(issueService.deleteIssue).mockResolvedValue(undefined);

    await useIssueStore.getState().deleteIssue('issue-1');

    expect(useIssueStore.getState().issueIds).toHaveLength(0);
  });

  it('assignIssue updates assignee', async () => {
    const issue = buildIssue({ id: 'issue-1' });
    const assigned = buildIssue({ id: 'issue-1', assigneeId: 'user-2' });
    useIssueStore.setState({ issues: { 'issue-1': issue }, issueIds: ['issue-1'] });
    vi.mocked(issueService.assignIssue).mockResolvedValue(assigned);

    await useIssueStore.getState().assignIssue('issue-1', 'user-2');

    expect(useIssueStore.getState().issues['issue-1']?.assigneeId).toBe('user-2');
  });

  it('updateNotes persists notes', async () => {
    const issue = buildIssue({ id: 'issue-1' });
    const updated = buildIssue({ id: 'issue-1', notes: 'New notes' });
    useIssueStore.setState({ issues: { 'issue-1': issue }, issueIds: ['issue-1'] });
    vi.mocked(issueService.updateNotes).mockResolvedValue(updated);

    await useIssueStore.getState().updateNotes('issue-1', 'New notes');

    expect(useIssueStore.getState().issues['issue-1']?.notes).toBe('New notes');
  });

  it('updateIssueDate clears date when undefined', async () => {
    const issue = buildIssue({ id: 'issue-1', dueDate: '2024-06-01T00:00:00.000Z' });
    useIssueStore.setState({ issues: { 'issue-1': issue }, issueIds: ['issue-1'] });
    vi.mocked(issueService.updateIssue).mockResolvedValue({ ...issue, dueDate: undefined });

    await useIssueStore.getState().updateIssueDate('issue-1', undefined);

    expect(useIssueStore.getState().issues['issue-1']?.dueDate).toBeUndefined();
    expect(issueService.updateIssue).toHaveBeenCalledWith('issue-1', { dueDate: '' });
  });

  it('selectors filter issues by state and assignee', () => {
    useIssueStore.setState({
      issues: {
        'issue-1': buildIssue({ id: 'issue-1', state: 'todo', assigneeId: 'user-1' }),
        'issue-2': buildIssue({ id: 'issue-2', state: 'done', assigneeId: 'user-2' }),
      },
      issueIds: ['issue-1', 'issue-2'],
    });

    expect(useIssueStore.getState().getIssuesByState('todo')).toHaveLength(1);
    expect(useIssueStore.getState().getIssuesByAssignee('user-2')).toHaveLength(1);
  });

  it('setSelectedIssue and clearError update ui state', () => {
    useIssueStore.getState().setSelectedIssue('issue-1');
    expect(useIssueStore.getState().selectedIssueId).toBe('issue-1');

    useIssueStore.setState({ errors: { op: 'failed' } });
    useIssueStore.getState().clearError('op');
    expect(useIssueStore.getState().errors.op).toBeUndefined();

    useIssueStore.getState().clearError();
    expect(useIssueStore.getState().errors).toEqual({});
  });

  it('fetchIssuesByWorkspace handles errors', async () => {
    vi.mocked(issueService.getIssuesByWorkspace).mockRejectedValue(new Error('Failed'));

    await useIssueStore.getState().fetchIssuesByWorkspace('workspace-1');

    expect(useIssueStore.getState().errors.fetchIssuesByWorkspace).toBe('Failed to fetch issues');
  });

  it('fetchIssueById returns null when issue is missing', async () => {
    vi.mocked(issueService.getIssueById).mockResolvedValue(null as never);

    const fetched = await useIssueStore.getState().fetchIssueById('missing');

    expect(fetched).toBeNull();
  });

  it('createIssue returns null on failure', async () => {
    vi.mocked(issueService.createIssue).mockRejectedValue(new Error('Failed'));

    const created = await useIssueStore.getState().createIssue({
      title: 'Broken',
      teamId: 'team-1',
      workspaceId: 'workspace-1',
    });

    expect(created).toBeNull();
  });

  it('updateIssue is a no-op when issue does not exist', async () => {
    await useIssueStore.getState().updateIssue('missing', { title: 'Nope' });
    expect(issueService.updateIssue).not.toHaveBeenCalled();
  });

  it('deleteIssue records error on failure', async () => {
    useIssueStore.setState({ issues: { 'issue-1': buildIssue() }, issueIds: ['issue-1'] });
    vi.mocked(issueService.deleteIssue).mockRejectedValue(new Error('Failed'));

    await useIssueStore.getState().deleteIssue('issue-1');

    expect(useIssueStore.getState().errors['deleteIssue_issue-1']).toBe('Failed to delete issue');
  });

  it('updateIssueDate sets due date optimistically', async () => {
    const issue = buildIssue({ id: 'issue-1' });
    useIssueStore.setState({ issues: { 'issue-1': issue }, issueIds: ['issue-1'] });
    vi.mocked(issueService.updateIssue).mockResolvedValue(issue);
    const dueDate = new Date('2024-12-01T00:00:00.000Z');

    await useIssueStore.getState().updateIssueDate('issue-1', dueDate);

    expect(useIssueStore.getState().selectedIssueDate).toEqual(dueDate);
    expect(issueService.updateIssue).toHaveBeenCalledWith('issue-1', {
      dueDate: dueDate.toISOString(),
    });
  });

  it('updateIssueDate reverts on failure', async () => {
    const issue = buildIssue({ id: 'issue-1', dueDate: '2024-06-01T00:00:00.000Z' });
    useIssueStore.setState({ issues: { 'issue-1': issue }, issueIds: ['issue-1'] });
    vi.mocked(issueService.updateIssue).mockRejectedValue(new Error('Failed'));
    const dueDate = new Date('2024-12-01T00:00:00.000Z');

    await useIssueStore.getState().updateIssueDate('issue-1', dueDate);

    expect(useIssueStore.getState().issues['issue-1']?.dueDate).toBe('2024-06-01T00:00:00.000Z');
  });
});
