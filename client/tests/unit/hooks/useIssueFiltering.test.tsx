import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIssueFiltering } from '@/hooks/useIssueFiltering';
import { useIssueStore } from '@/stores/issueStore';
import { useSavedFilterStore } from '@/stores/savedFilterStore';
import { buildIssue } from '../../helpers/fixtures';

describe('useIssueFiltering', () => {
  beforeEach(() => {
    useIssueStore.setState({
      issues: {
        'issue-1': buildIssue({ id: 'issue-1', state: 'todo', priority: 2, assigneeId: 'user-1' }),
        'issue-2': buildIssue({ id: 'issue-2', state: 'done', priority: 0, assigneeId: 'user-2' }),
      },
      issueIds: ['issue-1', 'issue-2'],
    });
    useSavedFilterStore.setState({
      defaultFilter: null,
      selectedViewId: 'none',
    });
  });

  it('returns all issues when filters are at defaults', () => {
    const { result } = renderHook(() => useIssueFiltering());

    expect(result.current.filteredIssues).toHaveLength(2);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('filters issues by state', () => {
    const { result } = renderHook(() => useIssueFiltering());

    act(() => {
      result.current.setStateFilter('todo');
    });

    expect(result.current.filteredIssues).toHaveLength(1);
    expect(result.current.filteredIssues[0]?.state).toBe('todo');
    expect(result.current.filterSummary).toContain('State: todo');
  });

  it('filters issues by priority', () => {
    const { result } = renderHook(() => useIssueFiltering());

    act(() => {
      result.current.setPriorityFilter('2');
    });

    expect(result.current.filteredIssues).toHaveLength(1);
    expect(result.current.filteredIssues[0]?.priority).toBe(2);
  });

  it('filters issues by assignee', () => {
    const { result } = renderHook(() => useIssueFiltering());

    act(() => {
      result.current.setAssigneeFilter('user-2');
    });

    expect(result.current.filteredIssues).toHaveLength(1);
    expect(result.current.filteredIssues[0]?.assigneeId).toBe('user-2');
  });

  it('clears all filters', () => {
    const { result } = renderHook(() => useIssueFiltering());

    act(() => {
      result.current.setStateFilter('todo');
      result.current.clearAllFilters();
    });

    expect(result.current.stateFilter).toBe('All');
    expect(result.current.priorityFilter).toBe('All');
    expect(result.current.filteredIssues).toHaveLength(2);
  });

  it('applies default filter from saved filter store', () => {
    useSavedFilterStore.setState({
      defaultFilter: {
        id: 'filter-1',
        name: 'My view',
        filter_config: {
          stateFilter: 'done',
          priorityFilter: 'All',
          sortOption: 'None',
          assigneeFilter: 'All',
        },
      } as never,
    });

    const { result } = renderHook(() => useIssueFiltering());

    expect(result.current.stateFilter).toBe('done');
    expect(result.current.filteredIssues).toHaveLength(1);
    expect(result.current.filteredIssues[0]?.state).toBe('done');
  });

  it('resets filters when default filter is cleared', () => {
    useSavedFilterStore.setState({
      defaultFilter: {
        id: 'filter-1',
        name: 'My view',
        filter_config: { stateFilter: 'done' },
      } as never,
    });

    const { result, rerender } = renderHook(() => useIssueFiltering());

    act(() => {
      useSavedFilterStore.setState({ defaultFilter: null });
    });
    rerender();

    expect(result.current.stateFilter).toBe('All');
  });

  it('builds filter summary with sort option', () => {
    const { result } = renderHook(() => useIssueFiltering());

    act(() => {
      result.current.setSortOption('Priority');
    });

    expect(result.current.filterSummary).toContain('Sort: Priority');
  });
});
