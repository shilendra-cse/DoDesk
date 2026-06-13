import { describe, it, expect } from 'vitest';
import { cleanSlug, validateSlugInput } from '@/shared/utils/slug';

describe('cleanSlug', () => {
  it('lowercases and trims input', () => {
    expect(cleanSlug('  My-Team  ')).toBe('my-team');
  });

  it('removes invalid characters', () => {
    expect(cleanSlug('hello world!')).toBe('helloworld');
    expect(cleanSlug('team@123')).toBe('team123');
  });

  it('strips leading and trailing hyphens', () => {
    expect(cleanSlug('--my-team--')).toBe('my-team');
  });
});

describe('validateSlugInput', () => {
  it('accepts a valid slug', () => {
    expect(validateSlugInput('my-team')).toEqual({ clean: 'my-team' });
  });

  it('rejects slugs shorter than 3 characters', () => {
    expect(validateSlugInput('ab')).toEqual({
      clean: 'ab',
      error: 'Workspace URL must be at least 3 characters long',
    });
  });

  it('rejects slugs with invalid characters', () => {
    expect(validateSlugInput('my team')).toEqual({
      clean: 'myteam',
      error: 'Workspace URL can only contain letters, numbers, and hyphens',
    });
  });
});
