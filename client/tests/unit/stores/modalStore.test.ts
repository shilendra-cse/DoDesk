import { describe, it, expect, beforeEach } from 'vitest';
import { useModalStore } from '@/stores/modalStore';

describe('useModalStore', () => {
  beforeEach(() => {
    useModalStore.setState({
      createIssueOpen: false,
      createWorkspaceOpen: false,
      inviteMemberOpen: false,
    });
  });

  it('opens and closes create issue modal', () => {
    useModalStore.getState().openCreateIssue();
    expect(useModalStore.getState().createIssueOpen).toBe(true);

    useModalStore.getState().closeCreateIssue();
    expect(useModalStore.getState().createIssueOpen).toBe(false);
  });

  it('opens and closes create workspace modal', () => {
    useModalStore.getState().openCreateWorkspace();
    expect(useModalStore.getState().createWorkspaceOpen).toBe(true);

    useModalStore.getState().closeCreateWorkspace();
    expect(useModalStore.getState().createWorkspaceOpen).toBe(false);
  });

  it('opens and closes invite member modal', () => {
    useModalStore.getState().openInviteMember();
    expect(useModalStore.getState().inviteMemberOpen).toBe(true);

    useModalStore.getState().closeInviteMember();
    expect(useModalStore.getState().inviteMemberOpen).toBe(false);
  });
});
