import { describe, it, expect } from 'vitest';
import {
  createCommentSchema,
  updateCommentSchema,
  issueIdParamsSchema,
} from '@/resources/comments/comment.schema';

describe('createCommentSchema', () => {
  it('accepts valid comment payload', () => {
    const result = createCommentSchema.safeParse({
      body: { content: 'Looks good to me' },
      params: { issueId: 'issue-1' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = createCommentSchema.safeParse({
      body: { content: '' },
      params: { issueId: 'issue-1' },
    });

    expect(result.success).toBe(false);
  });
});

describe('updateCommentSchema', () => {
  it('rejects empty content on update', () => {
    const result = updateCommentSchema.safeParse({
      body: { content: '' },
      params: { commentId: 'comment-1' },
    });

    expect(result.success).toBe(false);
  });
});

describe('issueIdParamsSchema', () => {
  it('requires issueId param', () => {
    const result = issueIdParamsSchema.safeParse({ params: { issueId: '' } });

    expect(result.success).toBe(false);
  });
});
