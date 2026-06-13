import '../../helpers/integration-auth';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { runDbTests, setAuthUser } from '../../helpers/integration-auth';
import { useIntegrationDatabase } from '../../helpers/integration-db';
import { app } from '@/app';
import { seedUser } from '../../helpers/seed';

describe.skipIf(!runDbTests)('User routes (integration + DB)', () => {
  useIntegrationDatabase();

  it('GET /api/users/me returns the authenticated user', async () => {
    const { user } = await seedUser();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app).get('/api/users/me');

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(user.email);
    expect(response.body.data.user.id).toBe(user.id);
  });
});
