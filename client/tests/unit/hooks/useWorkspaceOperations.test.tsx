import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import api from '@/lib/axios';
import { useWorkspaceOperations } from '@/hooks/useWorkspaceOperations';
import { buildWorkspace } from '../../helpers/fixtures';

describe('useWorkspaceOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a workspace', async () => {
    const workspace = buildWorkspace();
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: { workspace } },
    } as never);

    const { result } = renderHook(() => useWorkspaceOperations());

    let created;
    await waitFor(async () => {
      created = await result.current.createWorkspace({ name: 'Acme', slug: 'acme' });
    });

    expect(created).toEqual(workspace);
    expect(result.current.loading).toBe(false);
  });

  it('checks slug availability', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { available: true, slug: 'acme' } },
    } as never);

    const { result } = renderHook(() => useWorkspaceOperations());

    const availability = await result.current.checkSlugAvailability('acme');

    expect(availability).toEqual({ available: true, slug: 'acme' });
  });
});
