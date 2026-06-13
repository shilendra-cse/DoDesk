import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

import api from '@/lib/axios';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { buildWorkspace, buildTeam } from '../../helpers/fixtures';

describe('useWorkspaceStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useWorkspaceStore.setState({
      workspaces: [],
      currentWorkspace: null,
      lastActiveWorkspaceId: null,
      isLoading: true,
      hasWorkspaces: false,
      teams: [],
      members: [],
      currentUser: null,
    });
  });

  it('fetchWorkspaces sets current workspace from last active id', async () => {
    const workspace = buildWorkspace({ id: 'ws-1', teams: [buildTeam()] });
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/api/users/me') {
        return Promise.resolve({
          data: { success: true, data: { user: { id: 'user-1', email: 'a@b.com', lastActiveWorkspaceId: 'ws-1' } } },
        } as never);
      }
      return Promise.resolve({
        data: { success: true, data: { workspaces: [workspace] } },
      } as never);
    });

    await useWorkspaceStore.getState().fetchWorkspaces();

    const state = useWorkspaceStore.getState();
    expect(state.currentWorkspace?.id).toBe('ws-1');
    expect(state.hasWorkspaces).toBe(true);
    expect(state.currentUser?.email).toBe('a@b.com');
  });

  it('fetchWorkspaces clears state on failure', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Failed'));

    await useWorkspaceStore.getState().fetchWorkspaces();

    expect(useWorkspaceStore.getState().workspaces).toEqual([]);
    expect(useWorkspaceStore.getState().hasWorkspaces).toBe(false);
  });

  it('fetchTeams loads teams for current workspace', async () => {
    const workspace = buildWorkspace({ id: 'ws-1' });
    useWorkspaceStore.setState({ currentWorkspace: workspace });
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { teams: [buildTeam()] } },
    } as never);

    await useWorkspaceStore.getState().fetchTeams();

    expect(useWorkspaceStore.getState().teams).toHaveLength(1);
  });

  it('fetchMembers transforms backend members', async () => {
    useWorkspaceStore.setState({ currentWorkspace: buildWorkspace({ id: 'ws-1' }) });
    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          members: [{ id: 'm-1', user_id: 'user-1', name: 'Alice', email: 'alice@example.com' }],
        },
      },
    } as never);

    await useWorkspaceStore.getState().fetchMembers();

    expect(useWorkspaceStore.getState().members[0]).toMatchObject({
      userId: 'user-1',
      user: { email: 'alice@example.com' },
    });
  });

  it('switchWorkspace updates active workspace', async () => {
    const workspace = buildWorkspace({ id: 'ws-1', slug: 'acme', teams: [buildTeam()] });
    useWorkspaceStore.setState({ workspaces: [workspace] });
    vi.mocked(api.patch).mockResolvedValue({} as never);

    await useWorkspaceStore.getState().switchWorkspace('acme');

    expect(useWorkspaceStore.getState().currentWorkspace?.slug).toBe('acme');
    expect(api.patch).toHaveBeenCalledWith('/api/users/me/active-workspace', { workspaceId: 'ws-1' });
  });

  it('addWorkspace appends and selects workspace', async () => {
    const workspace = buildWorkspace({ id: 'ws-new', teams: [buildTeam()] });
    vi.mocked(api.patch).mockResolvedValue({} as never);

    await useWorkspaceStore.getState().addWorkspace(workspace);

    expect(useWorkspaceStore.getState().workspaces).toContainEqual(workspace);
    expect(useWorkspaceStore.getState().currentWorkspace?.id).toBe('ws-new');
  });

  it('getWorkspaceBySlug finds workspace', () => {
    const workspace = buildWorkspace({ slug: 'beta' });
    useWorkspaceStore.setState({ workspaces: [workspace] });

    expect(useWorkspaceStore.getState().getWorkspaceBySlug('beta')).toEqual(workspace);
  });

  it('setCurrentWorkspaceBySlug updates teams without duplicate set', () => {
    const workspace = buildWorkspace({ id: 'ws-1', slug: 'acme', teams: [buildTeam()] });
    useWorkspaceStore.setState({ workspaces: [workspace], currentWorkspace: workspace });

    useWorkspaceStore.getState().setCurrentWorkspaceBySlug('acme');

    expect(useWorkspaceStore.getState().currentWorkspace?.id).toBe('ws-1');
  });

  it('fetchWorkspaces falls back to first workspace when last active is missing', async () => {
    const workspace = buildWorkspace({ id: 'ws-1' });
    vi.mocked(api.get).mockImplementation((url: string) => {
      if (url === '/api/users/me') {
        return Promise.resolve({
          data: { success: true, data: { user: { id: 'user-1', email: 'a@b.com', lastActiveWorkspaceId: null } } },
        } as never);
      }
      return Promise.resolve({
        data: { success: true, data: { workspaces: [workspace] } },
      } as never);
    });

    await useWorkspaceStore.getState().fetchWorkspaces();

    expect(useWorkspaceStore.getState().currentWorkspace?.id).toBe('ws-1');
  });

  it('fetchTeams is a no-op without current workspace', async () => {
    await useWorkspaceStore.getState().fetchTeams();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('fetchTeams clears teams on failure', async () => {
    useWorkspaceStore.setState({ currentWorkspace: buildWorkspace({ id: 'ws-1' }), teams: [buildTeam()] });
    vi.mocked(api.get).mockRejectedValue(new Error('Failed'));

    await useWorkspaceStore.getState().fetchTeams();

    expect(useWorkspaceStore.getState().teams).toEqual([]);
  });

  it('fetchMembers clears members on failure', async () => {
    useWorkspaceStore.setState({ currentWorkspace: buildWorkspace({ id: 'ws-1' }), members: [] });
    vi.mocked(api.get).mockRejectedValue(new Error('Failed'));

    await useWorkspaceStore.getState().fetchMembers();

    expect(useWorkspaceStore.getState().members).toEqual([]);
  });

  it('switchWorkspace ignores unknown slug', async () => {
    await useWorkspaceStore.getState().switchWorkspace('missing');
    expect(api.patch).not.toHaveBeenCalled();
  });

  it('addWorkspace skips duplicate workspace entries', async () => {
    const workspace = buildWorkspace({ id: 'ws-1' });
    useWorkspaceStore.setState({ workspaces: [workspace] });
    vi.mocked(api.patch).mockResolvedValue({} as never);

    await useWorkspaceStore.getState().addWorkspace(workspace);

    expect(useWorkspaceStore.getState().workspaces).toHaveLength(1);
  });

  it('setCurrentWorkspaceBySlug clears state for unknown slug', () => {
    useWorkspaceStore.setState({ workspaces: [buildWorkspace({ slug: 'acme' })] });

    useWorkspaceStore.getState().setCurrentWorkspaceBySlug('missing');

    expect(useWorkspaceStore.getState().currentWorkspace).toBeNull();
    expect(useWorkspaceStore.getState().teams).toEqual([]);
  });
});
