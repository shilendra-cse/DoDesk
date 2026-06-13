import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '@/lib/axios';
import { useTeamStore } from '@/stores/teamStore';
import { buildTeam } from '../../helpers/fixtures';

describe('useTeamStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTeamStore.setState({ teams: [], members: [], isLoading: false, error: null });
  });

  it('fetchTeams loads teams', async () => {
    const team = buildTeam();
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { teams: [team] } },
    } as never);

    await useTeamStore.getState().fetchTeams('workspace-1');

    expect(useTeamStore.getState().teams).toEqual([team]);
    expect(useTeamStore.getState().isLoading).toBe(false);
  });

  it('fetchTeams stores error on failure', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network down'));

    await useTeamStore.getState().fetchTeams('workspace-1');

    expect(useTeamStore.getState().error).toBe('Network down');
    expect(useTeamStore.getState().isLoading).toBe(false);
  });

  it('fetchMembers loads members', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { members: [{ id: 'member-1' }] },
    } as never);

    await useTeamStore.getState().fetchMembers('team-1');

    expect(useTeamStore.getState().members).toEqual([{ id: 'member-1' }]);
  });

  it('addTeam appends created team', async () => {
    const team = buildTeam({ id: 'team-new' });
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: { team } },
    } as never);

    const created = await useTeamStore.getState().addTeam('workspace-1', { name: 'Design', key: 'DES' });

    expect(created).toEqual(team);
    expect(useTeamStore.getState().teams).toContainEqual(team);
  });

  it('updateTeam replaces team in list', async () => {
    const team = buildTeam();
    useTeamStore.setState({ teams: [team] });
    vi.mocked(api.put).mockResolvedValue({
      data: { team: { ...team, name: 'Renamed' } },
    } as never);

    const updated = await useTeamStore.getState().updateTeam('team-1', { name: 'Renamed' });

    expect(updated?.name).toBe('Renamed');
    expect(useTeamStore.getState().teams[0]?.name).toBe('Renamed');
  });

  it('deleteTeam removes team from list', async () => {
    useTeamStore.setState({ teams: [buildTeam()] });
    vi.mocked(api.delete).mockResolvedValue({} as never);

    await useTeamStore.getState().deleteTeam('team-1');

    expect(useTeamStore.getState().teams).toHaveLength(0);
  });

  it('fetchMembers stores non-Error failures as generic message', async () => {
    vi.mocked(api.get).mockRejectedValue('bad');

    await useTeamStore.getState().fetchMembers('team-1');

    expect(useTeamStore.getState().error).toBe('Failed to fetch members');
  });

  it('addTeam returns null on failure', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('Create failed'));

    const created = await useTeamStore.getState().addTeam('workspace-1', { name: 'Ops', key: 'OPS' });

    expect(created).toBeNull();
    expect(useTeamStore.getState().error).toBe('Create failed');
  });

  it('updateTeam returns null on failure', async () => {
    useTeamStore.setState({ teams: [buildTeam()] });
    vi.mocked(api.put).mockRejectedValue(new Error('Update failed'));

    const updated = await useTeamStore.getState().updateTeam('team-1', { name: 'Broken' });

    expect(updated).toBeNull();
  });

  it('deleteTeam stores error on failure', async () => {
    vi.mocked(api.delete).mockRejectedValue(new Error('Delete failed'));

    await useTeamStore.getState().deleteTeam('team-1');

    expect(useTeamStore.getState().error).toBe('Delete failed');
  });
});
