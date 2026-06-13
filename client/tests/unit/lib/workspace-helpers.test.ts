import { describe, it, expect } from 'vitest';
import {
  getDefaultWorkspaceSlug,
  getWorkspaceRedirectUrl,
  validateWorkspaceAccess,
  getWorkspaceBySlug,
} from '@/lib/workspace-helpers';
import { buildWorkspace } from '../../helpers/fixtures';

describe('workspace helpers', () => {
  const workspaces = [
    buildWorkspace({ id: 'ws-1', slug: 'acme' }),
    buildWorkspace({ id: 'ws-2', slug: 'beta' }),
  ];

  describe('getDefaultWorkspaceSlug', () => {
    it('returns slug for matching default workspace id', () => {
      expect(getDefaultWorkspaceSlug(workspaces, 'ws-1')).toBe('acme');
    });

    it('returns null when default id is missing', () => {
      expect(getDefaultWorkspaceSlug(workspaces, null)).toBeNull();
    });

    it('returns null when workspaces list is empty', () => {
      expect(getDefaultWorkspaceSlug([], 'ws-1')).toBeNull();
    });

    it('returns null when default id does not match any workspace', () => {
      expect(getDefaultWorkspaceSlug(workspaces, 'missing')).toBeNull();
    });
  });

  describe('getWorkspaceRedirectUrl', () => {
    it('redirects to myissues when default workspace exists', () => {
      expect(getWorkspaceRedirectUrl(workspaces, 'ws-1')).toBe('/acme/myissues');
    });

    it('redirects to onboarding when no default workspace', () => {
      expect(getWorkspaceRedirectUrl(workspaces, null)).toBe('/onboarding');
    });
  });

  describe('validateWorkspaceAccess', () => {
    it('returns true when slug exists in workspaces', () => {
      expect(validateWorkspaceAccess(workspaces, 'beta')).toBe(true);
    });

    it('returns false when slug is not found', () => {
      expect(validateWorkspaceAccess(workspaces, 'unknown')).toBe(false);
    });

    it('returns false when workspaces list is empty', () => {
      expect(validateWorkspaceAccess([], 'acme')).toBe(false);
    });
  });

  describe('getWorkspaceBySlug', () => {
    it('returns workspace when slug matches', () => {
      expect(getWorkspaceBySlug(workspaces, 'beta')).toEqual(workspaces[1]);
    });

    it('returns null when slug is empty', () => {
      expect(getWorkspaceBySlug(workspaces, '')).toBeNull();
    });

    it('returns null when slug is not found', () => {
      expect(getWorkspaceBySlug(workspaces, 'missing')).toBeNull();
    });
  });
});
