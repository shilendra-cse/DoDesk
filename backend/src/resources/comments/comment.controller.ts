import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { commentService } from './comment.service';

export const getComments = asyncHandler(async (req, res) => {
  const comments = await commentService.getByIssue(req.params.issueId!);
  sendSuccess(res, { comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.create(req.params.issueId!, req.user.id, req.body);
  sendSuccess(res, { comment }, 201, 'Comment created successfully');
});

export const updateComment = asyncHandler(async (req, res) => {
  const comment = await commentService.update(req.params.commentId!, req.body.content);
  sendSuccess(res, { comment }, 200, 'Comment updated successfully');
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await commentService.delete(req.params.commentId!);
  sendSuccess(res, { comment }, 200, 'Comment deleted successfully');
});
