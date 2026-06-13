import '../../helpers/integration-auth';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { runDbTests, setAuthUser } from '../../helpers/integration-auth';
import { useIntegrationDatabase } from '../../helpers/integration-db';
import { app } from '@/app';
import { prisma } from '../../helpers/db';
import { seedUserWithTeam } from '../../helpers/seed';

describe.skipIf(!runDbTests)('Issue routes (integration + DB)', () => {
  useIntegrationDatabase();

  it('POST /api/teams/:teamId/issues creates an issue in the database', async () => {
    const { user, team } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'Fix login bug', priority: 2 });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.issue.title).toBe('Fix login bug');
    expect(response.body.data.issue.issueKey).toBe('ENG-1');

    const dbIssue = await prisma.issue.findFirst({ where: { teamId: team.id } });
    expect(dbIssue?.title).toBe('Fix login bug');
    expect(dbIssue?.creatorId).toBe(user.id);
  });

  it('GET /api/issues/:issueId returns the issue', async () => {
    const { user, team } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const createResponse = await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'Bug report' });

    const issueId = createResponse.body.data.issue.id;

    const response = await request(app).get(`/api/issues/${issueId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.issue.title).toBe('Bug report');
  });

  it('returns 400 when title is missing', async () => {
    const { user, team } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: '' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('PUT /api/issues/:issueId updates an issue', async () => {
    const { user, team } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const created = await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'Original title' });

    const issueId = created.body.data.issue.id;

    const response = await request(app)
      .put(`/api/issues/${issueId}`)
      .send({ title: 'Updated title', state: 'done' });

    expect(response.status).toBe(200);
    expect(response.body.data.issue.title).toBe('Updated title');
    expect(response.body.data.issue.state).toBe('done');
  });

  it('DELETE /api/issues/:issueId removes an issue', async () => {
    const { user, team } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const created = await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'To delete' });

    const issueId = created.body.data.issue.id;

    const response = await request(app).delete(`/api/issues/${issueId}`);

    expect(response.status).toBe(200);
    expect(await prisma.issue.findUnique({ where: { id: issueId } })).toBeNull();
  });

  it('GET /api/workspaces/:workspaceId/issues lists issues with filters', async () => {
    const { user, workspace, team } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'Login bug', state: 'todo', priority: 2 });

    await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'Other task', state: 'done', priority: 0 });

    const response = await request(app)
      .get(`/api/workspaces/${workspace.id}/issues`)
      .query({ state: 'todo', search: 'bug' });

    expect(response.status).toBe(200);
    expect(response.body.data.issues).toHaveLength(1);
    expect(response.body.data.issues[0].title).toBe('Login bug');
  });

  it('GET /api/teams/:teamId/issues lists team issues', async () => {
    const { user, team } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'Team issue' });

    const response = await request(app)
      .get(`/api/teams/${team.id}/issues`)
      .query({ priority: '0' });

    expect(response.status).toBe(200);
    expect(response.body.data.issues).toHaveLength(1);
  });

  it('GET /api/workspaces/:workspaceId/issues filters by assignee', async () => {
    const { user, workspace, team } = await seedUserWithTeam();
    const assignee = await prisma.user.create({
      data: {
        email: `assignee-${Date.now()}@example.com`,
        name: 'Assignee',
        emailVerified: true,
      },
    });
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'Assigned task', assigneeId: assignee.id });

    await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'Unassigned task' });

    const response = await request(app)
      .get(`/api/workspaces/${workspace.id}/issues`)
      .query({ assignee: assignee.id });

    expect(response.status).toBe(200);
    expect(response.body.data.issues).toHaveLength(1);
    expect(response.body.data.issues[0].title).toBe('Assigned task');
  });

  it('GET /api/teams/:teamId/issues filters by assignee and search', async () => {
    const { user, team } = await seedUserWithTeam();
    const assignee = await prisma.user.create({
      data: {
        email: `assignee-search-${Date.now()}@example.com`,
        name: 'Assignee',
        emailVerified: true,
      },
    });
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'Login regression', assigneeId: assignee.id });

    await request(app)
      .post(`/api/teams/${team.id}/issues`)
      .send({ title: 'Other task', assigneeId: assignee.id });

    const response = await request(app)
      .get(`/api/teams/${team.id}/issues`)
      .query({ assignee: assignee.id, search: 'login' });

    expect(response.status).toBe(200);
    expect(response.body.data.issues).toHaveLength(1);
    expect(response.body.data.issues[0].title).toBe('Login regression');
  });
});
