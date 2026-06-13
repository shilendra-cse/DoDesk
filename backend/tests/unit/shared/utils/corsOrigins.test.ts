import { describe, it, expect } from 'vitest';
import { buildCorsOrigins } from '@/shared/utils/corsOrigins';

describe('buildCorsOrigins', () => {
  it('returns default origins when frontendUrl is not set', () => {
    const origins = buildCorsOrigins();

    expect(origins).toContain('http://localhost:5173');
    expect(origins).toHaveLength(8);
  });

  it('appends frontendUrl when provided', () => {
    const origins = buildCorsOrigins('https://staging.dodesk.app');

    expect(origins).toContain('https://staging.dodesk.app');
    expect(origins).toHaveLength(9);
  });
});
