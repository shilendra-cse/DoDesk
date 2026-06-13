import '../../helpers/integration-auth';
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { runDbTests, setAuthUser } from '../../helpers/integration-auth';
import { useIntegrationDatabase } from '../../helpers/integration-db';
import { app } from '@/app';
import { prisma } from '../../helpers/db';
import { seedUserWithIssue } from '../../helpers/seed';

describe.skipIf(!runDbTests)('Comment routes (integration + DB)', () => {
  useIntegrationDatabase();

  it('POST /api/issues/:issueId/comments creates a comment', async () => {
    const { user, issue } = await seedUserWithIssue();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post(`/api/issues/${issue.id}/comments`)
      .send({ content: 'Looks good to me' });

    expect(response.status).toBe(201);
    expect(response.body.data.comment.content).toBe('Looks good to me');

    const dbComment = await prisma.comment.findFirst({ where: { issueId: issue.id } });
    expect(dbComment?.userId).toBe(user.id);
  });

  it('GET /api/issues/:issueId/comments lists comments', async () => {
    const { user, issue } = await seedUserWithIssue();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    await request(app)
      .post(`/api/issues/${issue.id}/comments`)
      .send({ content: 'First comment' });

    const response = await request(app).get(`/api/issues/${issue.id}/comments`);

    expect(response.status).toBe(200);
    expect(response.body.data.comments).toHaveLength(1);
  });

  it('PUT /api/comments/:commentId updates a comment', async () => {
    const { user, issue } = await seedUserWithIssue();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const created = await request(app)
      .post(`/api/issues/${issue.id}/comments`)
      .send({ content: 'Original' });

    const commentId = created.body.data.comment.id;

    const response = await request(app)
      .put(`/api/comments/${commentId}`)
      .send({ content: 'Updated text' });

    expect(response.status).toBe(200);
    expect(response.body.data.comment.content).toBe('Updated text');
  });

  it('DELETE /api/comments/:commentId removes a comment', async () => {
    const { user, issue } = await seedUserWithIssue();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const created = await request(app)
      .post(`/api/issues/${issue.id}/comments`)
      .send({ content: 'To delete' });

    const commentId = created.body.data.comment.id;

    const response = await request(app).delete(`/api/comments/${commentId}`);

    expect(response.status).toBe(200);
    expect(await prisma.comment.findUnique({ where: { id: commentId } })).toBeNull();
  });

  it('returns 400 for empty comment content', async () => {
    const { user, issue } = await seedUserWithIssue();
    setAuthUser({ id: user.id, email: user.email, name: user.name });

    const response = await request(app)
      .post(`/api/issues/${issue.id}/comments`)
      .send({ content: '' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
