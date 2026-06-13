import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const checkSlugAvailability = vi.fn();

vi.mock('@/hooks/useWorkspaceOperations', () => ({
  useWorkspaceOperations: () => ({
    checkSlugAvailability,
    createWorkspace: vi.fn(),
    loading: false,
  }),
}));

import { useSlugChecker } from '@/hooks/useSlugChecker';

describe('useSlugChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stays idle for short slugs', async () => {
    const { result } = renderHook(() => useSlugChecker('ab'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.status).toBe('idle');
    expect(checkSlugAvailability).not.toHaveBeenCalled();
  });

  it('stays idle for empty slug', async () => {
    const { result } = renderHook(() => useSlugChecker(''));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.status).toBe('idle');
  });

  it('marks slug as available', async () => {
    checkSlugAvailability.mockResolvedValue({ available: true, slug: 'acme-corp' });

    const { result } = renderHook(() => useSlugChecker('acme-corp'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.status).toBe('available');
  });

  it('marks slug as taken', async () => {
    checkSlugAvailability.mockResolvedValue({ available: false, slug: 'acme-corp' });

    const { result } = renderHook(() => useSlugChecker('acme-corp'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.status).toBe('taken');
  });

  it('marks slug check as error on failure', async () => {
    checkSlugAvailability.mockRejectedValue(new Error('Network error'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useSlugChecker('acme-corp'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.status).toBe('error');
  });
});
