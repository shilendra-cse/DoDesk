import prisma from '../../shared/db/prisma';
import { teamWithMembersInclude } from './team.types';

export const teamQuery = {
  findById: (id: string) =>
    prisma.team.findUnique({
      where: { id },
      select: { id: true, workspaceId: true, key: true, name: true },
    }),

  findUserByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  getUserName: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    return user?.name ?? '';
  },

  findMemberInWorkspace: (userId: string, workspaceId: string) =>
    prisma.teamMember.findFirst({
      where: { userId, team: { workspaceId } },
    }),

  findAdminInWorkspace: (userId: string, workspaceId: string) =>
    prisma.teamMember.findFirst({
      where: {
        userId,
        role: 'admin',
        team: { workspaceId },
      },
    }),

  findOrCreateDefaultTeam: async (workspaceId: string) => {
    const existing = await prisma.team.findFirst({
      where: { workspaceId, key: 'GEN' },
    });

    if (existing) return existing;

    return prisma.team.create({
      data: {
        name: 'General',
        key: 'GEN',
        workspaceId,
        color: '#6B7280',
      },
    });
  },

  createMember: (data: { userId: string; teamId: string; role: string }) =>
    prisma.teamMember.create({ data }),

  create: (data: {
    workspaceId: string;
    name: string;
    key: string;
    description?: string | null;
    color: string;
    creatorId: string;
    userId: string;
  }) =>
    prisma.team.create({
      data: {
        workspaceId: data.workspaceId,
        name: data.name,
        key: data.key.toUpperCase(),
        description: data.description ?? null,
        color: data.color,
        creatorId: data.creatorId,
        members: {
          create: {
            userId: data.userId,
            role: 'admin',
          },
        },
      },
      include: { members: true },
    }),

  findByWorkspace: (workspaceId: string) =>
    prisma.team.findMany({
      where: { workspaceId },
      include: teamWithMembersInclude,
      orderBy: { createdAt: 'desc' },
    }),

  findUserTeamsInWorkspace: (workspaceId: string, userId: string) =>
    prisma.team.findMany({
      where: {
        workspaceId,
        members: { some: { userId } },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true, joinedAt: true },
        },
      },
    }),
};
