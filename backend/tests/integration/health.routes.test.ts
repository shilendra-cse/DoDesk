/**
 * Integration test — hits the real Express app over HTTP (via Supertest).
 * No server process needed; Supertest calls app directly.
 *
 * This test does NOT need Postgres — /health has no DB dependency.
 * DB-backed route tests will come next (with docker-compose.test.yml).
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';

describe('GET /health', () => {
  it('returns healthy status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'healthy' });
  });
});

describe('GET /', () => {
  it('returns OK', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.text).toBe('OK');
  });
});
