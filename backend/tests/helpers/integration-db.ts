import { beforeAll, beforeEach } from 'vitest';
import { isDatabaseAvailable, resetDatabase } from './db';

export function useIntegrationDatabase(): void {
  beforeAll(async () => {
    const available = await isDatabaseAvailable();
    if (!available) {
      throw new Error('Postgres not available. Run: npm run test:db:up && npm run test:db:migrate');
    }
  });

  beforeEach(async () => {
    await resetDatabase();
  });
}
