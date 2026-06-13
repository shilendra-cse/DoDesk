import { describe, it, expect } from 'vitest';
import {
  createIssueSchema,
  updateIssueSchema,
  listIssuesQuerySchema,
} from '@/resources/issues/issue.schema';

describe('createIssueSchema', () => {
  it('accepts valid create payload', () => {
    const result = createIssueSchema.safeParse({
      body: { title: 'Fix bug', priority: 2 },
      params: { teamId: 'team-1' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = createIssueSchema.safeParse({
      body: { title: '' },
      params: { teamId: 'team-1' },
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing teamId', () => {
    const result = createIssueSchema.safeParse({
      body: { title: 'Fix bug' },
      params: { teamId: '' },
    });

    expect(result.success).toBe(false);
  });
});

describe('updateIssueSchema', () => {
  it('accepts partial update with at least one field', () => {
    const result = updateIssueSchema.safeParse({
      body: { title: 'Updated title' },
      params: { issueId: 'issue-1' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty body update', () => {
    const result = updateIssueSchema.safeParse({
      body: {},
      params: { issueId: 'issue-1' },
    });

    expect(result.success).toBe(false);
  });
});

describe('listIssuesQuerySchema', () => {
  it('accepts optional query filters', () => {
    const result = listIssuesQuerySchema.safeParse({
      query: { state: 'todo', search: 'bug' },
    });

    expect(result.success).toBe(true);
  });

  it('accepts empty query', () => {
    const result = listIssuesQuerySchema.safeParse({ query: {} });

    expect(result.success).toBe(true);
  });
});
