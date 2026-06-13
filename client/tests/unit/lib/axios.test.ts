import { describe, it, expect, vi, beforeEach } from 'vitest';

const { signOut } = vi.hoisted(() => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/auth-client', () => ({
  signOut,
}));

import api from '@/lib/axios';

describe('api axios instance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  it('signs out and redirects on 401 request errors', async () => {
    const handler = (api.interceptors.request as { handlers: Array<{ rejected: (error: unknown) => Promise<unknown> }> })
      .handlers[0]!.rejected;

    await expect(handler({ response: { status: 401 } })).rejects.toEqual({
      response: { status: 401 },
    });

    expect(signOut).toHaveBeenCalledOnce();
    expect(window.location.href).toBe('/signin');
  });

  it('rejects non-401 errors without signing out', async () => {
    const handler = (api.interceptors.request as { handlers: Array<{ rejected: (error: unknown) => Promise<unknown> }> })
      .handlers[0]!.rejected;

    await expect(handler({ response: { status: 500 } })).rejects.toEqual({
      response: { status: 500 },
    });

    expect(signOut).not.toHaveBeenCalled();
  });

  it('passes through successful request configs', () => {
    const handler = (api.interceptors.request as { handlers: Array<{ fulfilled: (value: unknown) => unknown }> })
      .handlers[0]!.fulfilled;
    const config = { headers: {} };

    expect(handler(config)).toBe(config);
  });
});
