import '../../helpers/integration-auth';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { runDbTests, setAuthUser } from '../../helpers/integration-auth';
import { useIntegrationDatabase } from '../../helpers/integration-db';
import { app } from '@/app';
import { prisma } from '../../helpers/db';
import { seedUser, seedUserWithTeam } from '../../helpers/seed';

describe.skipIf(!runDbTests)('Workspace routes (integration + DB)', () => {
  useIntegrationDatabase();

  it('POST /api/workspaces creates a workspace', async () => {
    const { user } = await seedUser();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post('/api/workspaces')
      .send({ name: 'Acme Corp', slug: 'acme-corp' });

    expect(response.status).toBe(201);
    expect(response.body.data.workspace.slug).toBe('acme-corp');

    const dbWorkspace = await prisma.workspace.findUnique({ where: { slug: 'acme-corp' } });
    expect(dbWorkspace?.creatorId).toBe(user.id);
  });

  it('GET /api/workspaces/check-slug/:slug reports availability', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const taken = await request(app).get(`/api/workspaces/check-slug/${workspace.slug}`);
    expect(taken.body.data.available).toBe(false);

    const free = await request(app).get('/api/workspaces/check-slug/brand-new-slug');
    expect(free.body.data.available).toBe(true);
  });

  it('GET /api/workspaces/check-slug rejects slug shorter than 3 characters', async () => {
    const { user } = await seedUser();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app).get('/api/workspaces/check-slug/ab');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/workspaces/:workspaceId/details returns workspace for member', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app).get(`/api/workspaces/${workspace.id}/details`);

    expect(response.status).toBe(200);
    expect(response.body.data.workspace.slug).toBe(workspace.slug);
    expect(response.body.data.workspace.role).toBe('admin');
  });

  it('GET /api/workspaces/:workspaceId/details returns member role for invited user', async () => {
    const { user, workspace } = await seedUserWithTeam();
    const invitee = await prisma.user.create({
      data: {
        email: `member-${Date.now()}@example.com`,
        name: 'Member',
        emailVerified: true,
      },
    });
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    await request(app)
      .post(`/api/workspaces/${workspace.id}/invite`)
      .send({ email: invitee.email });

    setAuthUser({ id: invitee.id, email: invitee.email, name: invitee.name });

    const response = await request(app).get(`/api/workspaces/${workspace.id}/details`);

    expect(response.status).toBe(200);
    expect(response.body.data.workspace.role).toBe('member');
  });

  it('GET /api/workspaces/:workspaceId/details returns 404 for non-member', async () => {
    const { workspace } = await seedUserWithTeam();
    const outsider = await prisma.user.create({
      data: {
        email: `outsider-${Date.now()}@example.com`,
        name: 'Outsider',
        emailVerified: true,
      },
    });
    setAuthUser({ id: outsider.id, email: outsider.email, name: outsider.name });

    const response = await request(app).get(`/api/workspaces/${workspace.id}/details`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/workspaces lists workspaces for user', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app).get('/api/workspaces');

    expect(response.status).toBe(200);
    expect(response.body.data.workspaces.some((w: { id: string }) => w.id === workspace.id)).toBe(true);
  });

  it('GET /api/workspaces/:workspaceId/members returns members', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app).get(`/api/workspaces/${workspace.id}/members`);

    expect(response.status).toBe(200);
    expect(response.body.data.members.length).toBeGreaterThan(0);
  });

  it('GET /api/workspaces/:workspaceId/members/unique returns unique users', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app).get(`/api/workspaces/${workspace.id}/members/unique`);

    expect(response.status).toBe(200);
    expect(response.body.data.members.some((m: { email: string }) => m.email === user.email)).toBe(true);
  });

  it('POST /api/workspaces/:workspaceId/invite invites a new email', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post(`/api/workspaces/${workspace.id}/invite`)
      .send({ email: 'brand-new@example.com' });

    expect(response.status).toBe(200);

    const invitation = await prisma.workspaceInvitation.findFirst({
      where: { workspaceId: workspace.id, email: 'brand-new@example.com' },
    });
    expect(invitation).not.toBeNull();
  });

  it('POST /api/workspaces/:workspaceId/invite adds existing user to workspace', async () => {
    const { user, workspace } = await seedUserWithTeam();
    const invitee = await prisma.user.create({
      data: {
        email: `invitee-${Date.now()}@example.com`,
        name: 'Invitee',
        emailVerified: true,
      },
    });
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post(`/api/workspaces/${workspace.id}/invite`)
      .send({ email: invitee.email });

    expect(response.status).toBe(200);

    const membership = await prisma.teamMember.findFirst({
      where: { userId: invitee.id, team: { workspaceId: workspace.id } },
    });
    expect(membership).not.toBeNull();
  });

  it('PATCH /api/users/me/active-workspace sets active workspace', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .patch('/api/users/me/active-workspace')
      .send({ workspaceId: workspace.id });

    expect(response.status).toBe(200);

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updatedUser?.lastActiveWorkspaceId).toBe(workspace.id);
  });

  it('returns 400 for invalid slug on create', async () => {
    const { user } = await seedUser();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post('/api/workspaces')
      .send({ name: 'Bad', slug: 'a' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
