import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import { runDbTests } from '../helpers/integration-auth';
import { app } from '@/app';
import prisma from '@/shared/db/prisma';

describe.skipIf(!runDbTests)('App routes (integration + DB)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /test-db confirms database connectivity', async () => {
    const response = await request(app).get('/test-db');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Database connected!');
  });

  it('GET /test-db returns 500 with error message when query fails', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('Connection refused'));

    const response = await request(app).get('/test-db');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Connection refused');
  });

  it('GET /test-db returns unknown error for non-Error throws', async () => {
    vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce('db down');

    const response = await request(app).get('/test-db');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Unknown error');
  });
});
