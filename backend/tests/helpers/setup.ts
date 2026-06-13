// Global test setup — runs once before all test files.
// Dummy env for importing app/auth in integration tests.
process.env.BETTER_AUTH_SECRET ??= 'test-secret-at-least-thirty-two-chars';
process.env.BETTER_AUTH_URL ??= 'http://localhost:5033';
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5433/dodesk_test';
