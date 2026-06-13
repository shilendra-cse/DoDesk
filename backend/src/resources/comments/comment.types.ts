import { Prisma } from '@prisma/client';

export const commentIncludes = {
  user: { select: { id: true, name: true, email: true } },
  replies: {
    where: { user: { isNot: null } },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
} as const;

export type CommentWithRelations = Prisma.CommentGetPayload<{
  include: typeof commentIncludes;
}>;
