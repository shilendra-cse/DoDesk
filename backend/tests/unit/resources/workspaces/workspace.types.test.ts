import { describe, it, expect } from 'vitest';
import { formatWorkspaceMember, formatTeamMember } from '@/resources/workspaces/workspace.types';

describe('formatWorkspaceMember', () => {
  it('maps user fields to workspace member dto', () => {
    expect(
      formatWorkspaceMember({
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
      }),
    ).toEqual({
      id: 'user-1',
      user_id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
    });
  });
});

describe('formatTeamMember', () => {
  it('maps team member with nested user', () => {
    expect(
      formatTeamMember({
        id: 'member-1',
        user: { id: 'user-1', name: 'Alice', email: 'alice@example.com' },
      }),
    ).toEqual({
      id: 'member-1',
      user_id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
    });
  });
});
