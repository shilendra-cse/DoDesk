import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorCodes } from '@/shared/errors/errorCodes';

vi.mock('@/resources/filters/filter.query', () => ({
  filterQuery: {
    findByWorkspace: vi.fn(),
    findDefault: vi.fn(),
    clearDefaults: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { filterService } from '@/resources/filters/filter.service';
import { filterQuery } from '@/resources/filters/filter.query';

describe('filterService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates filter and clears defaults when isDefault is true', async () => {
    const created = { id: 'filter-1', name: 'Default view', isDefault: true };
    vi.mocked(filterQuery.create).mockResolvedValue(created as never);

    const result = await filterService.create('user-1', 'workspace-1', {
      name: 'Default view',
      filters: { stateFilter: 'todo' },
      isDefault: true,
    });

    expect(filterQuery.clearDefaults).toHaveBeenCalledWith('user-1', 'workspace-1');
    expect(result).toEqual(created);
  });

  it('throws when updating filter owned by another user', async () => {
    vi.mocked(filterQuery.findById).mockResolvedValue({
      id: 'filter-1',
      userId: 'other-user',
      workspaceId: 'workspace-1',
    } as never);

    await expect(
      filterService.update('user-1', 'filter-1', { name: 'Nope' }),
    ).rejects.toMatchObject({
      code: ErrorCodes.FILTER_NOT_FOUND,
      statusCode: 404,
    });
  });

  it('deletes filter when user owns it', async () => {
    vi.mocked(filterQuery.findById).mockResolvedValue({
      id: 'filter-1',
      userId: 'user-1',
      workspaceId: 'workspace-1',
    } as never);

    await filterService.delete('user-1', 'filter-1');

    expect(filterQuery.delete).toHaveBeenCalledWith('filter-1');
  });

  it('returns default filter from query', async () => {
    vi.mocked(filterQuery.findDefault).mockResolvedValue({ id: 'filter-1', isDefault: true } as never);

    const result = await filterService.getDefault('user-1', 'workspace-1');

    expect(result).toEqual({ id: 'filter-1', isDefault: true });
  });

  it('updates filter when user owns it', async () => {
    vi.mocked(filterQuery.findById).mockResolvedValue({
      id: 'filter-1',
      userId: 'user-1',
      workspaceId: 'workspace-1',
    } as never);
    vi.mocked(filterQuery.update).mockResolvedValue({ id: 'filter-1', name: 'Renamed' } as never);

    const result = await filterService.update('user-1', 'filter-1', { name: 'Renamed' });

    expect(result).toEqual({ id: 'filter-1', name: 'Renamed' });
  });

  it('clears defaults when update sets isDefault to true', async () => {
    vi.mocked(filterQuery.findById).mockResolvedValue({
      id: 'filter-1',
      userId: 'user-1',
      workspaceId: 'workspace-1',
    } as never);
    vi.mocked(filterQuery.update).mockResolvedValue({ id: 'filter-1', isDefault: true } as never);

    await filterService.update('user-1', 'filter-1', { isDefault: true });

    expect(filterQuery.clearDefaults).toHaveBeenCalledWith('user-1', 'workspace-1');
  });

  it('throws when deleting filter owned by another user', async () => {
    vi.mocked(filterQuery.findById).mockResolvedValue({
      id: 'filter-1',
      userId: 'other-user',
      workspaceId: 'workspace-1',
    } as never);

    await expect(filterService.delete('user-1', 'filter-1')).rejects.toMatchObject({
      code: ErrorCodes.FILTER_NOT_FOUND,
      statusCode: 404,
    });
  });
});
