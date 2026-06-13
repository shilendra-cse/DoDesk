import { describe, it, expect } from 'vitest';
import { unwrap } from '@/lib/api';

describe('unwrap', () => {
  it('extracts data from a successful API response', () => {
    const response = {
      data: {
        success: true as const,
        data: { workspace: { id: 'ws-1', slug: 'acme' } },
      },
    };

    expect(unwrap(response)).toEqual({ workspace: { id: 'ws-1', slug: 'acme' } });
  });
});
