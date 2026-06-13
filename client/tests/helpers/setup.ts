import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
