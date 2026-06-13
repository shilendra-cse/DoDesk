import '../../helpers/integration-auth';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { runDbTests, setAuthUser } from '../../helpers/integration-auth';
import { useIntegrationDatabase } from '../../helpers/integration-db';
import { app } from '@/app';
import { prisma } from '../../helpers/db';
import { seedUserWithTeam } from '../../helpers/seed';

describe.skipIf(!runDbTests)('Team routes (integration + DB)', () => {
  useIntegrationDatabase();

  it('POST /api/workspaces/:workspaceId/teams creates a team', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post(`/api/workspaces/${workspace.id}/teams`)
      .send({ name: 'Design', key: 'des' });

    expect(response.status).toBe(201);
    expect(response.body.data.team.key).toBe('DES');

    const dbTeam = await prisma.team.findFirst({
      where: { workspaceId: workspace.id, key: 'DES' },
    });
    expect(dbTeam?.name).toBe('Design');
  });

  it('GET /api/workspaces/:workspaceId/teams lists teams for member', async () => {
    const { user, workspace, team } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app).get(`/api/workspaces/${workspace.id}/teams`);

    expect(response.status).toBe(200);
    expect(response.body.data.teams).toHaveLength(1);
    expect(response.body.data.teams[0].id).toBe(team.id);
    expect(response.body.data.teams[0].is_member).toBe(true);
  });

    it('returns 400 for invalid team key', async () => {
    const { user, workspace } = await seedUserWithTeam();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post(`/api/workspaces/${workspace.id}/teams`)
      .send({ name: 'Bad Key Team', key: 'eng1' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
