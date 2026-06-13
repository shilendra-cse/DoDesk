import { Request, Response, NextFunction } from 'express';
import { auth } from '../../lib/auth';
import { ErrorCodes } from '../errors/errorCodes';

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      res.status(401).json({
        success: false,
        error: { code: ErrorCodes.UNAUTHORIZED, message: 'Unauthorized' },
      });
      return;
    }

    (req as Request & { user: typeof session.user }).user = session.user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      error: { code: ErrorCodes.UNAUTHORIZED, message: 'Authentication failed' },
    });
  }
};
