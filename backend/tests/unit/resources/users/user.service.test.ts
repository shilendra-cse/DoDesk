import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorCodes } from '@/shared/errors/errorCodes';

vi.mock('@/resources/users/user.query', () => ({
  userQuery: {
    findById: vi.fn(),
  },
}));

import { userService } from '@/resources/users/user.service';
import { userQuery } from '@/resources/users/user.query';

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns current user profile', async () => {
    vi.mocked(userQuery.findById).mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'Alice',
      lastActiveWorkspaceId: null,
      lastActiveWorkspace: null,
    } as never);

    const result = await userService.getCurrentUser('user-1');

    expect(result.email).toBe('user@example.com');
  });

  it('throws when user does not exist', async () => {
    vi.mocked(userQuery.findById).mockResolvedValue(null);

    await expect(userService.getCurrentUser('missing')).rejects.toMatchObject({
      code: ErrorCodes.USER_NOT_FOUND,
      statusCode: 404,
    });
  });
});
