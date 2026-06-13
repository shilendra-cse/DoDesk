import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/commentService', () => ({
  commentService: {
    getComments: vi.fn(),
    createComment: vi.fn(),
    updateComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

import { commentService } from '@/services/commentService';
import { useCommentStore } from '@/stores/commentStore';
import { buildComment } from '../../helpers/fixtures';

describe('useCommentStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useCommentStore.setState({ comments: {}, loadingStates: {}, errors: {} });
  });

  it('fetchComments stores comments by issue', async () => {
    const comments = [buildComment()];
    vi.mocked(commentService.getComments).mockResolvedValue(comments);

    await useCommentStore.getState().fetchComments('issue-1');

    expect(useCommentStore.getState().comments['issue-1']).toEqual(comments);
  });

  it('fetchComments records error on failure', async () => {
    vi.mocked(commentService.getComments).mockRejectedValue(new Error('Failed'));

    await useCommentStore.getState().fetchComments('issue-1');

    expect(useCommentStore.getState().errors['fetchComments-issue-1']).toBe('Failed to fetch comments');
  });

  it('createComment appends comment', async () => {
    const comment = buildComment({ id: 'comment-new' });
    vi.mocked(commentService.createComment).mockResolvedValue(comment);

    const created = await useCommentStore.getState().createComment('issue-1', { content: 'Nice' });

    expect(created).toEqual(comment);
    expect(useCommentStore.getState().comments['issue-1']).toContainEqual(comment);
  });

  it('updateComment replaces matching comment', async () => {
    const original = buildComment({ id: 'comment-1', content: 'Old' });
    const updated = buildComment({ id: 'comment-1', content: 'New' });
    useCommentStore.setState({ comments: { 'issue-1': [original] } });
    vi.mocked(commentService.updateComment).mockResolvedValue(updated);

    await useCommentStore.getState().updateComment('comment-1', { content: 'New' });

    expect(useCommentStore.getState().comments['issue-1']?.[0]?.content).toBe('New');
  });

  it('deleteComment removes comment', async () => {
    useCommentStore.setState({ comments: { 'issue-1': [buildComment({ id: 'comment-1' })] } });
    vi.mocked(commentService.deleteComment).mockResolvedValue(undefined);

    await useCommentStore.getState().deleteComment('comment-1');

    expect(useCommentStore.getState().comments['issue-1']).toHaveLength(0);
  });

  it('clearError clears one or all errors', () => {
    useCommentStore.setState({ errors: { a: 'err-a', b: 'err-b' } });

    useCommentStore.getState().clearError('a');
    expect(useCommentStore.getState().errors).toEqual({ a: '', b: 'err-b' });

    useCommentStore.getState().clearError();
    expect(useCommentStore.getState().errors).toEqual({});
  });

  it('getCommentsByIssue returns comments or empty array', () => {
    useCommentStore.setState({ comments: { 'issue-1': [buildComment()] } });

    expect(useCommentStore.getState().getCommentsByIssue('issue-1')).toHaveLength(1);
    expect(useCommentStore.getState().getCommentsByIssue('missing')).toEqual([]);
  });

  it('createComment returns null on failure', async () => {
    vi.mocked(commentService.createComment).mockRejectedValue(new Error('Failed'));

    const created = await useCommentStore.getState().createComment('issue-1', { content: 'Oops' });

    expect(created).toBeNull();
    expect(useCommentStore.getState().errors['createComment-issue-1']).toBe('Failed to create comment');
  });

  it('updateComment records error on failure', async () => {
    vi.mocked(commentService.updateComment).mockRejectedValue(new Error('Failed'));

    await useCommentStore.getState().updateComment('comment-1', { content: 'Bad' });

    expect(useCommentStore.getState().errors['updateComment-comment-1']).toBe('Failed to update comment');
  });

  it('deleteComment records error on failure', async () => {
    vi.mocked(commentService.deleteComment).mockRejectedValue(new Error('Failed'));

    await useCommentStore.getState().deleteComment('comment-1');

    expect(useCommentStore.getState().errors['deleteComment-comment-1']).toBe('Failed to delete comment');
  });
});
