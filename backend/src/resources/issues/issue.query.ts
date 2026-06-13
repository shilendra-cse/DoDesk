import prisma from '../../shared/db/prisma';
import { Prisma } from '@prisma/client';
import { issueIncludes, issueIncludesMinimal, ListIssuesFilters } from './issue.types';

export const issueQuery = {
  findById: (id: string) =>
    prisma.issue.findUnique({ where: { id }, include: issueIncludes }),

  findByWorkspace: (workspaceId: string, filters: ListIssuesFilters) => {
    const where: Prisma.IssueWhereInput = {
      workspaceId,
      ...(filters.state && { state: filters.state }),
      ...(filters.assignee && { assigneeId: filters.assignee }),
      ...(filters.priority !== undefined && { priority: parseInt(filters.priority) }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.issue.findMany({
      where,
      include: issueIncludes,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
  },

  findByTeam: (teamId: string, filters: ListIssuesFilters) => {
    const where: Prisma.IssueWhereInput = {
      teamId,
      ...(filters.state && { state: filters.state }),
      ...(filters.assignee && { assigneeId: filters.assignee }),
      ...(filters.priority !== undefined && { priority: parseInt(filters.priority) }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    return prisma.issue.findMany({
      where,
      include: issueIncludes,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
  },

  getNextNumber: async (teamId: string) => {
    const last = await prisma.issue.findFirst({
      where: { teamId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });
    return (last?.number ?? 0) + 1;
  },

  create: (data: Prisma.IssueUncheckedCreateInput) =>
    prisma.issue.create({ data, include: issueIncludes }),

  update: (id: string, data: Prisma.IssueUpdateInput) =>
    prisma.issue.update({ where: { id }, data, include: issueIncludesMinimal }),

  delete: (id: string) =>
    prisma.issue.delete({
      where: { id },
      include: { team: { select: { key: true } } },
    }),
};
