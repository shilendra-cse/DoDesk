import { prisma } from './db';

export async function seedUser() {
  const suffix = Date.now();

  const user = await prisma.user.create({
    data: {
      email: `test-${suffix}@example.com`,
      name: 'Test User',
      emailVerified: true,
    },
  });

  return { user };
}

export async function seedUserWithTeam() {
  const suffix = Date.now();

  const user = await prisma.user.create({
    data: {
      email: `test-${suffix}@example.com`,
      name: 'Test User',
      emailVerified: true,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Test Workspace',
      slug: `test-${suffix}`,
      creatorId: user.id,
    },
  });

  const team = await prisma.team.create({
    data: {
      name: 'Engineering',
      key: 'ENG',
      workspaceId: workspace.id,
      creatorId: user.id,
      members: {
        create: {
          userId: user.id,
          role: 'admin',
        },
      },
    },
  });

  return { user, workspace, team };
}

export async function seedUserWithIssue() {
  const { user, workspace, team } = await seedUserWithTeam();

  const issue = await prisma.issue.create({
    data: {
      title: 'Test issue',
      number: 1,
      workspaceId: workspace.id,
      teamId: team.id,
      creatorId: user.id,
      state: 'todo',
      priority: 0,
      labels: [],
    },
  });

  return { user, workspace, team, issue };
}
