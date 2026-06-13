import prisma from '../../shared/db/prisma';

export const teamQuery = {
  findById: (id: string) =>
    prisma.team.findUnique({
      where: { id },
      select: { id: true, workspaceId: true, key: true, name: true },
    }),
};
