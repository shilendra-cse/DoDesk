import prisma from '../../shared/db/prisma';
import { commentIncludes } from './comment.types';

export const commentQuery = {
  findByIssue: (issueId: string) =>
    prisma.comment.findMany({
      where: {
        issueId,
        user: { isNot: null },
      },
      include: commentIncludes,
      orderBy: { createdAt: 'asc' },
    }),

  create: (data: {
    issueId: string;
    userId: string;
    content: string;
    parentCommentId?: string | null;
  }) =>
    prisma.comment.create({
      data: {
        issueId: data.issueId,
        userId: data.userId,
        content: data.content,
        parentCommentId: data.parentCommentId ?? null,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),

  update: (id: string, content: string) =>
    prisma.comment.update({
      where: { id },
      data: { content, updatedAt: new Date() },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),

  delete: (id: string) =>
    prisma.comment.delete({ where: { id } }),
};
