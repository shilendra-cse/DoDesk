import { describe, it, expect } from 'vitest';
import { createFilterSchema, updateFilterSchema } from '@/resources/filters/filter.schema';

describe('createFilterSchema', () => {
  it('accepts valid filter payload', () => {
    const result = createFilterSchema.safeParse({
      body: { name: 'My bugs', filters: { stateFilter: 'todo' } },
      params: { workspaceId: 'workspace-1' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty filter name', () => {
    const result = createFilterSchema.safeParse({
      body: { name: '', filters: {} },
      params: { workspaceId: 'workspace-1' },
    });

    expect(result.success).toBe(false);
  });
});

describe('updateFilterSchema', () => {
  it('accepts partial filter update', () => {
    const result = updateFilterSchema.safeParse({
      body: { name: 'Renamed view' },
      params: { filterId: 'filter-1' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty update body', () => {
    const result = updateFilterSchema.safeParse({
      body: {},
      params: { filterId: 'filter-1' },
    });

    expect(result.success).toBe(false);
  });
});
