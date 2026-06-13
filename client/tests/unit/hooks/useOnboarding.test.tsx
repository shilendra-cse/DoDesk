import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/lib/auth-client', () => ({
  useSession: vi.fn(),
}));

import { useSession } from '@/lib/auth-client';
import { useOnboarding } from '@/hooks/useOnboarding';

describe('useOnboarding', () => {
  beforeEach(() => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never);
  });

  it('starts at step 0 with empty user data', () => {
    const { result } = renderHook(() => useOnboarding());

    expect(result.current.currentStep).toBe(0);
    expect(result.current.userData).toEqual({ name: '', workspace: null });
  });

  it('advances and goes back between steps', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(1);

    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe(0);
  });

  it('does not go below step 0', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe(0);
  });

  it('updates user data', () => {
    const { result } = renderHook(() => useOnboarding());

    act(() => result.current.updateUserData({ name: 'Alice', workspace: { id: 'ws-1' } }));

    expect(result.current.userData.name).toBe('Alice');
    expect(result.current.userData.workspace).toEqual({ id: 'ws-1' });
  });

  it('loads name from session when available', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { name: 'Bob' } },
    } as never);

    const { result } = renderHook(() => useOnboarding());

    expect(result.current.userData.name).toBe('Bob');
  });

  it('uses fallback name when session user has no name', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: {} },
    } as never);

    const { result } = renderHook(() => useOnboarding());

    expect(result.current.userData.name).toBe('there');
  });
});
