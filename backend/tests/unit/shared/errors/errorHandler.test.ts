import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import { errorHandler } from '@/shared/errors/errorHandler';
import { AppError } from '@/shared/errors/AppError';
import { ErrorCodes } from '@/shared/errors/errorCodes';
import { createMockResponse, createMockNext } from '../../../helpers/express';

describe('errorHandler', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles AppError with correct status and body', () => {
    const res = createMockResponse();
    const err = new AppError('TEAM_NOT_FOUND', 404, 'Team not found');

    errorHandler(err, {} as never, res, createMockNext());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'TEAM_NOT_FOUND',
        message: 'Team not found',
      },
    });
  });

  it('handles ZodError as validation error', () => {
    const res = createMockResponse();
    const schema = z.object({ title: z.string().min(1) });
    let zodError: z.ZodError | undefined;
    try {
      schema.parse({ title: '' });
    } catch (error) {
      zodError = error as z.ZodError;
    }

    errorHandler(zodError!, {} as never, res, createMockNext());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Invalid request body',
      }),
    });
  });

  it('handles unknown errors as 500 internal error', () => {
    const res = createMockResponse();

    errorHandler(new Error('Database exploded'), {} as never, res, createMockNext());

    expect(console.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Internal server error',
      },
    });
  });
});
