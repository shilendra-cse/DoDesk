import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockRequest, createMockResponse, createMockNext } from '../../../helpers/express';

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { requireAuth } from '@/shared/middleware/auth.middleware';
import { auth } from '@/lib/auth';

describe('requireAuth middleware', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls next() when session exists', async () => {
    const sessionUser = { id: 'user-1', email: 'user@example.com', name: 'Alice' };
    vi.mocked(auth.api.getSession).mockResolvedValue({ user: sessionUser } as never);

    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect((req as { user?: typeof sessionUser }).user).toEqual(sessionUser);
  });

  it('returns 401 when session is missing', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when getSession throws', async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(new Error('Auth down'));

    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication failed' },
    });
  });
});
