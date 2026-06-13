import { asyncHandler } from '../../shared/middleware/asyncHandler';
import { sendSuccess } from '../../shared/responses/apiResponse';
import { userService } from './user.service';

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await userService.getCurrentUser(req.user.id);
  sendSuccess(res, { user });
});

export const getMe = asyncHandler(async (req, res) => {
  const result = await userService.getMe(req.user.id);
  sendSuccess(res, result);
});
