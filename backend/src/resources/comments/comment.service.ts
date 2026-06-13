import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../shared/errors/errorCodes';
import { commentQuery } from './comment.query';

export const commentService = {
  async getByIssue(issueId: string) {
    return commentQuery.findByIssue(issueId);
  },

  async create(
    issueId: string,
    userId: string,
    input: { content: string; parentCommentId?: string },
  ) {
    return commentQuery.create({
      issueId,
      userId,
      content: input.content,
      parentCommentId: input.parentCommentId ?? null,
    });
  },

  async update(commentId: string, content: string) {
    try {
      return await commentQuery.update(commentId, content);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new AppError(ErrorCodes.COMMENT_NOT_FOUND, 404, 'Comment not found');
      }
      throw error;
    }
  },

  async delete(commentId: string) {
    try {
      const comment = await commentQuery.delete(commentId);
      return comment;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        throw new AppError(ErrorCodes.COMMENT_NOT_FOUND, 404, 'Comment not found');
      }
      throw error;
    }
  },
};
