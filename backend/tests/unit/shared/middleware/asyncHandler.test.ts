import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from '@/shared/middleware/asyncHandler';
import { AppError } from '@/shared/errors/AppError';
import { createMockRequest, createMockResponse, createMockNext } from '../../../helpers/express';

describe('asyncHandler', () => {
  it('calls the handler and does not forward errors on success', async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();
    const handler = vi.fn().mockResolvedValue(undefined);

    await asyncHandler(handler)(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards rejected errors to next', async () => {
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();
    const failure = new AppError('ISSUE_NOT_FOUND', 404, 'Issue not found');
    const handler = vi.fn().mockRejectedValue(failure);

    await asyncHandler(handler)(req, res, next);

    expect(next).toHaveBeenCalledWith(failure);
  });
});
