import { z } from 'zod';

export const createIssueSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    state: z.string().optional(),
    priority: z.number().optional(),
    labels: z.array(z.string()).optional(),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional(),
  }),
  params: z.object({
    teamId: z.string().min(1),
  }),
});

export const updateIssueSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    state: z.string().optional(),
    priority: z.number().optional(),
    labels: z.array(z.string()).optional(),
    dueDate: z.string().optional(),
    assigneeId: z.string().nullable().optional(),
    notes: z.string().optional(),
  }).refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: 'No valid fields to update' },
  ),
  params: z.object({
    issueId: z.string().min(1),
  }),
});

export const listIssuesQuerySchema = z.object({
  query: z.object({
    state: z.string().optional(),
    assignee: z.string().optional(),
    priority: z.string().optional(),
    search: z.string().optional(),
  }),
});
