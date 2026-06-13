import { describe, it, expect } from 'vitest';
import { createTeamSchema, workspaceIdParamsSchema } from '@/resources/teams/team.schema';

describe('createTeamSchema', () => {
  it('accepts valid team payload', () => {
    const result = createTeamSchema.safeParse({
      body: { name: 'Engineering', key: 'ENG' },
      params: { workspaceId: 'workspace-1' },
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing team name', () => {
    const result = createTeamSchema.safeParse({
      body: { name: '', key: 'ENG' },
      params: { workspaceId: 'workspace-1' },
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing team key', () => {
    const result = createTeamSchema.safeParse({
      body: { name: 'Engineering', key: '' },
      params: { workspaceId: 'workspace-1' },
    });

    expect(result.success).toBe(false);
  });
});

describe('workspaceIdParamsSchema', () => {
  it('requires workspaceId param', () => {
    const result = workspaceIdParamsSchema.safeParse({ params: { workspaceId: '' } });

    expect(result.success).toBe(false);
  });
});
