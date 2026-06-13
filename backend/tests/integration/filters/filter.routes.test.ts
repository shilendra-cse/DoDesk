import '../../helpers/integration-auth';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { runDbTests, setAuthUser } from '../../helpers/integration-auth';
import { useIntegrationDatabase } from '../../helpers/integration-db';
import { app } from '@/app';
import { prisma } from '../../helpers/db';
import { seedUserWithTeam } from '../../helpers/seed';

describe.skipIf(!runDbTests)('Filter routes (integration + DB)', () => {
  useIntegrationDatabase();

  it('POST /api/workspaces/:workspaceId/filters creates a saved filter', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post(`/api/workspaces/${workspace.id}/filters`)
      .send({ name: 'My bugs', filters: { stateFilter: 'todo' } });

    expect(response.status).toBe(201);
    expect(response.body.data.filter.name).toBe('My bugs');

    const dbFilter = await prisma.savedFilter.findFirst({ where: { workspaceId: workspace.id } });
    expect(dbFilter?.userId).toBe(user.id);
  });

  it('GET /api/workspaces/:workspaceId/filters lists filters', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    await request(app)
      .post(`/api/workspaces/${workspace.id}/filters`)
      .send({ name: 'View 1', filters: { stateFilter: 'todo' } });

    const response = await request(app).get(`/api/workspaces/${workspace.id}/filters`);

    expect(response.status).toBe(200);
    expect(response.body.data.filters).toHaveLength(1);
  });

  it('GET /api/workspaces/:workspaceId/filters/default returns null when none set', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app).get(`/api/workspaces/${workspace.id}/filters/default`);

    expect(response.status).toBe(200);
    expect(response.body.data.filter).toBeNull();
  });

  it('creates a default filter and returns it from default endpoint', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    await request(app)
      .post(`/api/workspaces/${workspace.id}/filters`)
      .send({ name: 'Default', filters: { stateFilter: 'todo' }, isDefault: true });

    const response = await request(app).get(`/api/workspaces/${workspace.id}/filters/default`);

    expect(response.status).toBe(200);
    expect(response.body.data.filter.isDefault).toBe(true);
  });

  it('PUT /api/filters/:filterId updates a filter', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const created = await request(app)
      .post(`/api/workspaces/${workspace.id}/filters`)
      .send({ name: 'Old name', filters: { stateFilter: 'todo' } });

    const filterId = created.body.data.filter.id;

    const response = await request(app)
      .put(`/api/filters/${filterId}`)
      .send({ name: 'New name' });

    expect(response.status).toBe(200);
    expect(response.body.data.filter.name).toBe('New name');
  });

  it('DELETE /api/filters/:filterId removes a filter', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const created = await request(app)
      .post(`/api/workspaces/${workspace.id}/filters`)
      .send({ name: 'To delete', filters: {} });

    const filterId = created.body.data.filter.id;

    const response = await request(app).delete(`/api/filters/${filterId}`);

    expect(response.status).toBe(200);
    expect(await prisma.savedFilter.findUnique({ where: { id: filterId } })).toBeNull();
  });

  it('returns 400 for empty filter name', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post(`/api/workspaces/${workspace.id}/filters`)
      .send({ name: '', filters: {} });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
