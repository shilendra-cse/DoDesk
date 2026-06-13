import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { buildIssue } from '../../helpers/fixtures';

const updateIssue = vi.fn();
const updateNotes = vi.fn();

vi.mock('@/stores/issueStore', () => ({
  useIssueStore: () => ({
    updateIssue,
    updateNotes,
  }),
}));

import { useIssueEditor } from '@/hooks/useIssueEditor';

describe('useIssueEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes from the provided issue', () => {
    const issue = buildIssue({ notes: 'Initial notes' });
    const { result } = renderHook(() => useIssueEditor(issue));

    expect(result.current.editedIssue).toEqual(issue);
    expect(result.current.notes).toBe('Initial notes');
    expect(result.current.updateIssue).toBe(updateIssue);
  });

  it('resets state when issue id changes', () => {
    const issue = buildIssue({ id: 'issue-1', notes: 'First' });
    const { result, rerender } = renderHook(
      ({ currentIssue }) => useIssueEditor(currentIssue),
      { initialProps: { currentIssue: issue } },
    );

    act(() => {
      result.current.setNotes('Edited notes');
      result.current.setNewlyAddedAssigneeId('user-2');
    });

    const nextIssue = buildIssue({ id: 'issue-2', notes: 'Second' });
    rerender({ currentIssue: nextIssue });

    expect(result.current.editedIssue.id).toBe('issue-2');
    expect(result.current.notes).toBe('Second');
    expect(result.current.newlyAddedAssigneeId).toBeNull();
  });

  it('closes dropdown when clicking outside', () => {
    const issue = buildIssue();
    const { result } = renderHook(() => useIssueEditor(issue));

    const element = document.createElement('div');
    Object.defineProperty(result.current.stateDropdownRef, 'current', {
      value: element,
      writable: true,
    });

    act(() => {
      result.current.setDropdownType('state');
    });

    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(result.current.dropdownType).toBeNull();
  });

  it('uses priority dropdown ref when dropdown type is priority', () => {
    const issue = buildIssue();
    const { result } = renderHook(() => useIssueEditor(issue));

    const element = document.createElement('div');
    Object.defineProperty(result.current.priorityDropdownRef, 'current', {
      value: element,
      writable: true,
    });

    act(() => {
      result.current.setDropdownType('priority');
    });

    act(() => {
      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });

    expect(result.current.dropdownType).toBe('priority');
  });
});
