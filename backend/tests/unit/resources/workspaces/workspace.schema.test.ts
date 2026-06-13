import { describe, it, expect } from 'vitest';
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  setActiveWorkspaceSchema,
  slugParamsSchema,
} from '@/resources/workspaces/workspace.schema';

describe('createWorkspaceSchema', () => {
  it('accepts valid workspace payload', () => {
    const result = createWorkspaceSchema.safeParse({
      body: { name: 'Acme', slug: 'acme' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty slug', () => {
    const result = createWorkspaceSchema.safeParse({
      body: { name: 'Acme', slug: '' },
    });

    expect(result.success).toBe(false);
  });
});

describe('inviteMemberSchema', () => {
  it('accepts valid email invite', () => {
    const result = inviteMemberSchema.safeParse({
      body: { email: 'user@example.com' },
      params: { workspaceId: 'workspace-1' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = inviteMemberSchema.safeParse({
      body: { email: 'not-an-email' },
      params: { workspaceId: 'workspace-1' },
    });

    expect(result.success).toBe(false);
  });
});

describe('setActiveWorkspaceSchema', () => {
  it('requires workspaceId in body', () => {
    const result = setActiveWorkspaceSchema.safeParse({ body: { workspaceId: '' } });

    expect(result.success).toBe(false);
  });
});

describe('slugParamsSchema', () => {
  it('requires slug param', () => {
    const result = slugParamsSchema.safeParse({ params: { slug: '' } });

    expect(result.success).toBe(false);
  });
});
