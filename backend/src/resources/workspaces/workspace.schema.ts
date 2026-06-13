import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Workspace name is required'),
    slug: z.string().min(1, 'Workspace URL is required'),
  }),
});

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

export const setActiveWorkspaceSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1),
  }),
});

export const workspaceIdParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

export const slugParamsSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug parameter is required'),
  }),
});
