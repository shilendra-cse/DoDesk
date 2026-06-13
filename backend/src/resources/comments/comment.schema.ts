import { z } from 'zod';

export const issueIdParamsSchema = z.object({
  params: z.object({
    issueId: z.string().min(1),
  }),
});

export const commentIdParamsSchema = z.object({
  params: z.object({
    commentId: z.string().min(1),
  }),
});

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Content is required'),
    parentCommentId: z.string().optional(),
  }),
  params: z.object({
    issueId: z.string().min(1),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Content is required'),
  }),
  params: z.object({
    commentId: z.string().min(1),
  }),
});
