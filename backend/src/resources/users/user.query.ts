import prisma from '../../shared/db/prisma';

const userSelect = {
  id: true,
  email: true,
  name: true,
  lastActiveWorkspaceId: true,
} as const;

export const userQuery = {
  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: {
        ...userSelect,
        lastActiveWorkspace: true,
      },
    }),

  findByIdMinimal: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: userSelect,
    }),
};
