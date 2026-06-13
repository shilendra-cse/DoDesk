import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/savedFilterService', () => ({
  savedFilterService: {
    getSavedFilters: vi.fn(),
    getDefaultFilter: vi.fn(),
    createFilter: vi.fn(),
    deleteFilter: vi.fn(),
    setDefaultFilter: vi.fn(),
  },
}));

import { savedFilterService } from '@/services/savedFilterService';
import { useSavedFilterStore } from '@/stores/savedFilterStore';
import { buildSavedFilter } from '../../helpers/fixtures';

describe('useSavedFilterStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useSavedFilterStore.setState({
      savedFilters: [],
      defaultFilter: null,
      selectedViewId: 'none',
      loading: false,
      error: null,
    });
  });

  it('fetchSavedFilters loads filters and default', async () => {
    const filter = buildSavedFilter({ id: 'filter-1' });
    vi.mocked(savedFilterService.getSavedFilters).mockResolvedValue([filter]);
    vi.mocked(savedFilterService.getDefaultFilter).mockResolvedValue(filter);

    await useSavedFilterStore.getState().fetchSavedFilters('workspace-1');

    const state = useSavedFilterStore.getState();
    expect(state.savedFilters).toEqual([filter]);
    expect(state.defaultFilter).toEqual(filter);
    expect(state.selectedViewId).toBe('filter-1');
  });

  it('fetchSavedFilters records error on failure', async () => {
    vi.mocked(savedFilterService.getSavedFilters).mockRejectedValue(new Error('Failed'));

    await useSavedFilterStore.getState().fetchSavedFilters('workspace-1');

    expect(useSavedFilterStore.getState().error).toBe('Failed to fetch saved filters');
  });

  it('createFilter appends filter', async () => {
    const filter = buildSavedFilter({ id: 'filter-new' });
    vi.mocked(savedFilterService.createFilter).mockResolvedValue(filter);

    const created = await useSavedFilterStore.getState().createFilter('workspace-1', {
      name: 'Todo only',
      filter_config: { stateFilter: 'todo' },
    });

    expect(created).toEqual(filter);
    expect(useSavedFilterStore.getState().selectedViewId).toBe('filter-new');
  });

  it('deleteFilter removes filter and clears default when needed', async () => {
    const filter = buildSavedFilter({ id: 'filter-1' });
    useSavedFilterStore.setState({
      savedFilters: [filter],
      defaultFilter: filter,
      selectedViewId: 'filter-1',
    });
    vi.mocked(savedFilterService.deleteFilter).mockResolvedValue(undefined);

    await useSavedFilterStore.getState().deleteFilter('workspace-1', 'filter-1');

    const state = useSavedFilterStore.getState();
    expect(state.savedFilters).toHaveLength(0);
    expect(state.defaultFilter).toBeNull();
    expect(state.selectedViewId).toBe('none');
  });

  it('setDefaultFilter updates default and selected view', async () => {
    const filter = buildSavedFilter({ id: 'filter-1', is_default: true });
    vi.mocked(savedFilterService.setDefaultFilter).mockResolvedValue(filter);

    await useSavedFilterStore.getState().setDefaultFilter('workspace-1', 'filter-1');

    expect(useSavedFilterStore.getState().defaultFilter).toEqual(filter);
    expect(useSavedFilterStore.getState().selectedViewId).toBe('filter-1');
  });

  it('setSelectedViewId and clearSelectedView update selection', () => {
    useSavedFilterStore.getState().setSelectedViewId('filter-2');
    expect(useSavedFilterStore.getState().selectedViewId).toBe('filter-2');

    useSavedFilterStore.getState().clearSelectedView();
    expect(useSavedFilterStore.getState().selectedViewId).toBe('none');
  });

  it('clearError resets error state', () => {
    useSavedFilterStore.setState({ error: 'Something failed' });
    useSavedFilterStore.getState().clearError();
    expect(useSavedFilterStore.getState().error).toBeNull();
  });

  it('createFilter returns null on failure', async () => {
    vi.mocked(savedFilterService.createFilter).mockRejectedValue(new Error('Failed'));

    const created = await useSavedFilterStore.getState().createFilter('workspace-1', {
      name: 'Broken',
      filter_config: {},
    });

    expect(created).toBeNull();
    expect(useSavedFilterStore.getState().error).toBe('Failed to create filter');
  });

  it('deleteFilter records error on failure', async () => {
    vi.mocked(savedFilterService.deleteFilter).mockRejectedValue(new Error('Failed'));

    await useSavedFilterStore.getState().deleteFilter('workspace-1', 'filter-1');

    expect(useSavedFilterStore.getState().error).toBe('Failed to delete filter');
  });

  it('setDefaultFilter records error on failure', async () => {
    vi.mocked(savedFilterService.setDefaultFilter).mockRejectedValue(new Error('Failed'));

    await useSavedFilterStore.getState().setDefaultFilter('workspace-1', 'filter-1');

    expect(useSavedFilterStore.getState().error).toBe('Failed to set default filter');
  });
});
