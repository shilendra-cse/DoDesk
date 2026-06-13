import prisma from '@/shared/db/prisma';

export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "comments",
      "issues",
      "saved_filters",
      "workspace_invitations",
      "team_members",
      "teams",
      "workspaces",
      "session",
      "account",
      "verification",
      "users"
    RESTART IDENTITY CASCADE;
  `);
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

export { prisma };
