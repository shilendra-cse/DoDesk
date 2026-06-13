import { describe, it, expect } from 'vitest';
import { sendSuccess, sendError } from '@/shared/responses/apiResponse';
import { AppError } from '@/shared/errors/AppError';
import { createMockResponse } from '../../../helpers/express';

describe('sendSuccess', () => {
  it('returns 200 with success envelope by default', () => {
    const res = createMockResponse();
    const data = { id: 'issue-1', title: 'Fix bug' };

    sendSuccess(res, data);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data,
    });
  });

  it('supports custom status and message', () => {
    const res = createMockResponse();

    sendSuccess(res, { created: true }, 201, 'Issue created');

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { created: true },
      message: 'Issue created',
    });
  });
});

describe('sendError', () => {
  it('returns error envelope with status from AppError', () => {
    const res = createMockResponse();
    const error = new AppError('ISSUE_NOT_FOUND', 404, 'Issue not found');

    sendError(res, error);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'ISSUE_NOT_FOUND',
        message: 'Issue not found',
      },
    });
  });

  it('includes details when present', () => {
    const res = createMockResponse();
    const details = [{ field: 'body.title', message: 'Required' }];
    const error = new AppError('VALIDATION_ERROR', 400, 'Invalid request body', details);

    sendError(res, error);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request body',
        details,
      },
    });
  });
});
