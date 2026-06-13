import { Prisma } from '@prisma/client';

export const workspaceWithTeamsInclude = {
  teams: {
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  },
} as const;

export type WorkspaceWithTeams = Prisma.WorkspaceGetPayload<{
  include: typeof workspaceWithTeamsInclude;
}>;

export interface WorkspaceMemberDto {
  id: string;
  user_id: string;
  name: string | null;
  email: string;
}

export interface WorkspaceDetailsDto {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  created_by: string;
  role: string;
}

export function formatWorkspaceMember(user: {
  id: string;
  name: string | null;
  email: string;
}): WorkspaceMemberDto {
  return {
    id: user.id,
    user_id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function formatTeamMember(member: {
  id: string;
  user: { id: string; name: string | null; email: string };
}): WorkspaceMemberDto {
  return {
    id: member.id,
    user_id: member.user.id,
    name: member.user.name,
    email: member.user.email,
  };
}
