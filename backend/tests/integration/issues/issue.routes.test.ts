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
});
