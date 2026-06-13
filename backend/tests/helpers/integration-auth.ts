import { vi } from 'vitest';

export type AuthUser = { id: string; email: string; name: string | null };

let currentAuthUser: AuthUser = { id: '', email: '', name: null };

export function setAuthUser(user: AuthUser): void {
  currentAuthUser = user;
}

vi.mock('@/shared/middleware/auth.middleware', () => ({
  requireAuth: (req: { user?: AuthUser }, _res: unknown, next: () => void) => {
    req.user = currentAuthUser;
    next();
  },
}));

vi.mock('@/shared/utils/email', () => ({
  sendEmail: vi.fn(),
}));

export const runDbTests = process.env.VITEST_WITH_DB === '1';
