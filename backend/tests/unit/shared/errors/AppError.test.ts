import { describe, it, expect } from 'vitest';
import { AppError } from '@/shared/errors/AppError';

describe('AppError', () => {
  it('sets code, statusCode, and message', () => {
    const error = new AppError('ISSUE_NOT_FOUND', 404, 'Issue not found');

    expect(error.code).toBe('ISSUE_NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Issue not found');
  });

  it('uses code as message when message is omitted', () => {
    const error = new AppError('VALIDATION_ERROR', 400);

    expect(error.message).toBe('VALIDATION_ERROR');
  });

  it('stores optional details', () => {
    const details = [{ field: 'title', message: 'Required' }];
    const error = new AppError('VALIDATION_ERROR', 400, 'Invalid request', details);

    expect(error.details).toEqual(details);
  });

  it('is an instance of Error', () => {
    const error = new AppError('UNAUTHORIZED', 401);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });
});
