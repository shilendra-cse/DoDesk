import { Prisma } from '@prisma/client';

export const issueIncludes = {
  creator: { select: { id: true, name: true, email: true } },
  assignee: { select: { id: true, name: true, email: true } },
  team: { select: { key: true, name: true, color: true } },
  _count: { select: { comments: true } },
} as const;

export const issueIncludesMinimal = {
  creator: { select: { name: true } },
  assignee: { select: { name: true } },
  team: { select: { key: true, name: true } },
} as const;

export type IssueWithRelations = Prisma.IssueGetPayload<{
  include: typeof issueIncludes;
}>;

export type IssueWithMinimalRelations = Prisma.IssueGetPayload<{
  include: typeof issueIncludesMinimal;
}>;

export type FormattedIssue = ReturnType<typeof formatIssue>;

export function formatIssue(issue: IssueWithRelations) {
  const { _count, team, ...rest } = issue;
  return {
    ...rest,
    team: { key: team.key, name: team.name, color: team.color },
    issueKey: `${team.key}-${issue.number}`,
    commentCount: _count.comments,
  };
}

export function formatIssueMinimal(issue: IssueWithMinimalRelations) {
  const { team, ...rest } = issue;
  return {
    ...rest,
    issueKey: `${team.key}-${issue.number}`,
  };
}

export function formatDeletedIssue(issue: Prisma.IssueGetPayload<{
  include: { team: { select: { key: true } } };
}>) {
  const { team, ...rest } = issue;
  return {
    ...rest,
    issueKey: `${team.key}-${issue.number}`,
  };
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  state?: string;
  priority?: number;
  labels?: string[];
  dueDate?: string;
  teamId: string;
  assigneeId?: string;
  creatorId: string;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  state?: string;
  priority?: number;
  labels?: string[];
  dueDate?: string;
  assigneeId?: string | null;
  notes?: string;
}

export interface ListIssuesFilters {
  state?: string;
  assignee?: string;
  priority?: string;
  search?: string;
}
