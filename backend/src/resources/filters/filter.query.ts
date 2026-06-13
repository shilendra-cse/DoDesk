import prisma from '../../shared/db/prisma';
import { Prisma } from '@prisma/client';

export const filterQuery = {
  findByWorkspace: (userId: string, workspaceId: string) =>
    prisma.savedFilter.findMany({
      where: { userId, workspaceId },
      orderBy: { createdAt: 'desc' },
    }),

  findDefault: (userId: string, workspaceId: string) =>
    prisma.savedFilter.findFirst({
      where: { userId, workspaceId, isDefault: true },
    }),

  findById: (filterId: string) =>
    prisma.savedFilter.findUnique({ where: { id: filterId } }),

  clearDefaults: (userId: string, workspaceId: string) =>
    prisma.savedFilter.updateMany({
      where: { userId, workspaceId, isDefault: true },
      data: { isDefault: false },
    }),

  create: (data: {
    name: string;
    filters: Prisma.InputJsonValue;
    isDefault: boolean;
    userId: string;
    workspaceId: string;
  }) =>
    prisma.savedFilter.create({ data }),

  update: (filterId: string, data: Prisma.SavedFilterUpdateInput) =>
    prisma.savedFilter.update({ where: { id: filterId }, data }),

  delete: (filterId: string) =>
    prisma.savedFilter.delete({ where: { id: filterId } }),
};
