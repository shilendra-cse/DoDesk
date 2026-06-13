import { disconnectDatabase } from './db';

export default async function globalTeardown(): Promise<void> {
  if (process.env.VITEST_WITH_DB === '1') {
    await disconnectDatabase();
  }
}
