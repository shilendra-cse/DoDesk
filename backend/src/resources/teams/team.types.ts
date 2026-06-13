import { Prisma } from '@prisma/client';

export const teamWithMembersInclude = {
  members: {
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  },
  _count: { select: { members: true } },
} as const;

export type TeamWithMembers = Prisma.TeamGetPayload<{
  include: typeof teamWithMembersInclude;
}>;

export function formatWorkspaceTeam(team: TeamWithMembers, userId: string) {
  const transformedMembers = team.members.map((member) => ({
    id: member.id,
    userId: member.userId,
    teamId: member.teamId,
    role: member.role,
    joinedAt: member.joinedAt,
    updatedAt: member.updatedAt,
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
    },
  }));

  return {
    ...team,
    members: transformedMembers,
    member_count: team._count.members,
    is_member: team.members.some((member) => member.userId === userId),
  };
}

export function formatUserTeam(team: Prisma.TeamGetPayload<{
  include: {
    members: {
      where: { userId: string };
      select: { role: true; joinedAt: true };
    };
  };
}>) {
  const member = team.members[0];
  return {
    ...team,
    role: member?.role || 'member',
    joined_at: member?.joinedAt || new Date(),
  };
}
