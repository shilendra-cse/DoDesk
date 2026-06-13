import { describe, it, expect } from 'vitest';
import type { AxiosResponse } from 'axios';
import { unwrap, type ApiSuccess } from '@/lib/api';

describe('unwrap', () => {
  it('extracts data from a successful API response', () => {
    const response = {
      data: {
        success: true as const,
        data: { workspace: { id: 'ws-1', slug: 'acme' } },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as AxiosResponse<ApiSuccess<{ workspace: { id: string; slug: string } }>>;

    expect(unwrap(response)).toEqual({ workspace: { id: 'ws-1', slug: 'acme' } });
  });
});
