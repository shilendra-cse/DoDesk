import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/helpers/setup.ts'],
    globalTeardown: './tests/helpers/global-teardown.ts',
    fileParallelism: process.env.VITEST_WITH_DB === '1' ? false : true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'tests/**',
        'src/server.ts',
        'src/index.ts',
        'src/lib/auth.ts',
        'src/shared/db/**',
      ],
      thresholds: process.env.VITEST_WITH_DB === '1'
        ? { lines: 85, branches: 85, functions: 82, statements: 84 }
        : undefined,
    },
  },
});
