import { z } from 'zod';

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Team name is required'),
    key: z.string().min(1, 'Team key is required'),
    description: z.string().optional(),
    color: z.string().optional(),
  }),
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

export const workspaceIdParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});
