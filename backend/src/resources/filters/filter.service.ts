import { Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../shared/errors/errorCodes';
import { filterQuery } from './filter.query';

export const filterService = {
  async list(userId: string, workspaceId: string) {
    return filterQuery.findByWorkspace(userId, workspaceId);
  },

  async getDefault(userId: string, workspaceId: string) {
    return filterQuery.findDefault(userId, workspaceId);
  },

  async create(
    userId: string,
    workspaceId: string,
    input: { name: string; filters: Prisma.InputJsonValue; isDefault?: boolean },
  ) {
    const isDefault = input.isDefault ?? false;

    if (isDefault) {
      await filterQuery.clearDefaults(userId, workspaceId);
    }

    return filterQuery.create({
      name: input.name,
      filters: input.filters,
      isDefault,
      userId,
      workspaceId,
    });
  },

  async update(
    userId: string,
    filterId: string,
    input: { name?: string; filters?: Prisma.InputJsonValue; isDefault?: boolean },
  ) {
    const filter = await filterQuery.findById(filterId);
    if (!filter || filter.userId !== userId) {
      throw new AppError(ErrorCodes.FILTER_NOT_FOUND, 404, 'Saved filter not found');
    }

    if (input.isDefault) {
      await filterQuery.clearDefaults(userId, filter.workspaceId);
    }

    const data: Prisma.SavedFilterUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.filters !== undefined) data.filters = input.filters;
    if (input.isDefault !== undefined) data.isDefault = input.isDefault;

    return filterQuery.update(filterId, data);
  },

  async delete(userId: string, filterId: string) {
    const filter = await filterQuery.findById(filterId);
    if (!filter || filter.userId !== userId) {
      throw new AppError(ErrorCodes.FILTER_NOT_FOUND, 404, 'Saved filter not found');
    }

    await filterQuery.delete(filterId);
  },
};
