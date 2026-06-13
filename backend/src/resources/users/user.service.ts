import { AppError } from '../../shared/errors/AppError';
import { ErrorCodes } from '../../shared/errors/errorCodes';
import { userQuery } from './user.query';

export const userService = {
  async getCurrentUser(userId: string) {
    const user = await userQuery.findById(userId);

    if (!user) {
      throw new AppError(ErrorCodes.USER_NOT_FOUND, 404, 'User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      lastActiveWorkspaceId: user.lastActiveWorkspaceId,
      lastActiveWorkspace: user.lastActiveWorkspace,
    };
  },

  async getMe(userId: string) {
    const user = await userQuery.findByIdMinimal(userId);

    if (!user) {
      throw new AppError(ErrorCodes.USER_NOT_FOUND, 404, 'User not found');
    }

    return { user };
  },
};
