import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePagination } from '@/hooks/usePagination';

describe('usePagination', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];

  it('returns first page of items', () => {
    const { result } = renderHook(() => usePagination(items, 2, 1));

    expect(result.current.currentItems).toEqual(['a', 'b']);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(false);
    expect(result.current.startIndex).toBe(1);
    expect(result.current.endIndex).toBe(2);
    expect(result.current.totalItems).toBe(5);
  });

  it('returns middle page with prev and next', () => {
    const { result } = renderHook(() => usePagination(items, 2, 2));

    expect(result.current.currentItems).toEqual(['c', 'd']);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(true);
    expect(result.current.startIndex).toBe(3);
    expect(result.current.endIndex).toBe(4);
  });

  it('returns last partial page', () => {
    const { result } = renderHook(() => usePagination(items, 2, 3));

    expect(result.current.currentItems).toEqual(['e']);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(true);
    expect(result.current.endIndex).toBe(5);
  });

  it('handles empty list', () => {
    const { result } = renderHook(() => usePagination([], 10, 1));

    expect(result.current.currentItems).toEqual([]);
    expect(result.current.totalPages).toBe(0);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPrevPage).toBe(false);
  });
});
