import { z } from 'zod';

export const workspaceIdParamsSchema = z.object({
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

export const filterIdParamsSchema = z.object({
  params: z.object({
    filterId: z.string().min(1),
  }),
});

export const createFilterSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    filters: z.record(z.string(), z.unknown()),
    isDefault: z.boolean().optional(),
  }),
  params: z.object({
    workspaceId: z.string().min(1),
  }),
});

export const updateFilterSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    filters: z.record(z.string(), z.unknown()).optional(),
    isDefault: z.boolean().optional(),
  }).refine(
    (data) => Object.values(data).some((v) => v !== undefined),
    { message: 'Nothing to update' },
  ),
  params: z.object({
    filterId: z.string().min(1),
  }),
});
