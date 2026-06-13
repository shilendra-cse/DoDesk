import prisma from '../../shared/db/prisma';
import { workspaceWithTeamsInclude } from './workspace.types';

export const workspaceQuery = {
  findBySlug: (slug: string) =>
    prisma.workspace.findUnique({ where: { slug } }),

  findById: (id: string) =>
    prisma.workspace.findUnique({ where: { id } }),

  findByIdForUser: (workspaceId: string, userId: string) =>
    prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { creatorId: userId },
          { teams: { some: { members: { some: { userId } } } } },
        ],
      },
      include: {
        teams: {
          include: {
            members: {
              where: { userId },
              select: { role: true },
            },
          },
        },
      },
    }),

  findAllForUser: (userId: string) =>
    prisma.workspace.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { teams: { some: { members: { some: { userId } } } } },
        ],
      },
      include: workspaceWithTeamsInclude,
      orderBy: { createdAt: 'desc' },
    }),

  create: (data: {
    name: string;
    slug: string;
    creatorId: string;
  }) =>
    prisma.workspace.create({
      data: {
        name: data.name,
        slug: data.slug,
        creatorId: data.creatorId,
        teams: {
          create: {
            name: 'General',
            key: 'GEN',
            color: '#6B7280',
            members: {
              create: { userId: data.creatorId, role: 'admin' },
            },
          },
        },
      },
      include: workspaceWithTeamsInclude,
    }),

  getMembers: (workspaceId: string) =>
    prisma.teamMember.findMany({
      where: { team: { workspaceId } },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),

  getUniqueMembers: (workspaceId: string) =>
    prisma.user.findMany({
      where: {
        teamMemberships: {
          some: { team: { workspaceId } },
        },
      },
      select: { id: true, name: true, email: true },
      distinct: ['id'],
    }),

  createInvitation: (email: string, workspaceId: string) =>
    prisma.workspaceInvitation.create({
      data: { email, workspaceId },
    }),

  setUserLastActiveWorkspace: (userId: string, workspaceId: string) =>
    prisma.user.update({
      where: { id: userId },
      data: { lastActiveWorkspaceId: workspaceId },
    }),

  getUser: (userId: string) =>
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, lastActiveWorkspaceId: true },
    }),
};
