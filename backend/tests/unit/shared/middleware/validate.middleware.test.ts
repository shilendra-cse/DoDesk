import { describe, it, expect } from 'vitest';
import { validate } from '@/shared/middleware/validate.middleware';
import { createIssueSchema } from '@/resources/issues/issue.schema';
import { AppError } from '@/shared/errors/AppError';
import { ErrorCodes } from '@/shared/errors/errorCodes';
import { createMockRequest, createMockResponse, createMockNext } from '../../../helpers/express';

describe('validate middleware', () => {
  it('calls next() when request matches schema', () => {
    const req = createMockRequest({
      body: { title: 'Fix bug' },
      params: { teamId: 'team-1' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validate(createIssueSchema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(AppError) when body validation fails', () => {
    const req = createMockRequest({
      body: { title: '' },
      params: { teamId: 'team-1' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validate(createIssueSchema)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    const error = next.mock.calls[0]![0];
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect((error as AppError).statusCode).toBe(400);
    expect((error as AppError).details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'body.title' }),
      ]),
    );
  });

  it('calls next(AppError) when params validation fails', () => {
    const req = createMockRequest({
      body: { title: 'Fix bug' },
      params: { teamId: '' },
    });
    const res = createMockResponse();
    const next = createMockNext();

    validate(createIssueSchema)(req, res, next);

    const error = next.mock.calls[0]![0] as AppError;
    expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    expect(error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'params.teamId' }),
      ]),
    );
  });
});
