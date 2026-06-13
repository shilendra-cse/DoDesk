import { describe, it, expect } from 'vitest';
import { isValidEmail } from '@/shared/utils/isValidEmail';

describe('isValidEmail', () => {
  it('returns true for a standard email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('returns false when @ is missing', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('returns false when domain is missing', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});
