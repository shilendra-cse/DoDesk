import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '@/shared/errors/AppError';
import { ErrorCodes } from '@/shared/errors/errorCodes';

vi.mock('@/resources/comments/comment.query', () => ({
  commentQuery: {
    findByIssue: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { commentService } from '@/resources/comments/comment.service';
import { commentQuery } from '@/resources/comments/comment.query';

describe('commentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a comment', async () => {
    const created = { id: 'comment-1', content: 'Hello', issueId: 'issue-1' };
    vi.mocked(commentQuery.create).mockResolvedValue(created as never);

    const result = await commentService.create('issue-1', 'user-1', { content: 'Hello' });

    expect(result).toEqual(created);
    expect(commentQuery.create).toHaveBeenCalledWith({
      issueId: 'issue-1',
      userId: 'user-1',
      content: 'Hello',
      parentCommentId: null,
    });
  });

  it('maps P2025 to comment not found on update', async () => {
    vi.mocked(commentQuery.update).mockRejectedValue({ code: 'P2025' });

    await expect(commentService.update('missing', 'text')).rejects.toMatchObject({
      code: ErrorCodes.COMMENT_NOT_FOUND,
      statusCode: 404,
    });
  });

  it('maps P2025 to comment not found on delete', async () => {
    vi.mocked(commentQuery.delete).mockRejectedValue({ code: 'P2025' });

    await expect(commentService.delete('missing')).rejects.toBeInstanceOf(AppError);
  });

  it('rethrows non-P2025 errors from update', async () => {
    vi.mocked(commentQuery.update).mockRejectedValue(new Error('Write failed'));

    await expect(commentService.update('comment-1', 'text')).rejects.toThrow('Write failed');
  });

  it('rethrows non-P2025 errors from delete', async () => {
    vi.mocked(commentQuery.delete).mockRejectedValue(new Error('Write failed'));

    await expect(commentService.delete('comment-1')).rejects.toThrow('Write failed');
  });
});
