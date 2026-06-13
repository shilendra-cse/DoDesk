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

  it('GET /api/workspaces/:workspaceId/details returns workspace for member', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app).get(`/api/workspaces/${workspace.id}/details`);

    expect(response.status).toBe(200);
    expect(response.body.data.workspace.slug).toBe(workspace.slug);
    expect(response.body.data.workspace.role).toBe('admin');
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
