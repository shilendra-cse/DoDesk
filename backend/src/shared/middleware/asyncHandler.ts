import { RequestHandler } from 'express';
import { AuthenticatedRequest } from '../types/express';

type AuthenticatedHandler = (
  req: AuthenticatedRequest,
  res: Parameters<RequestHandler>[1],
  next: Parameters<RequestHandler>[2],
) => void | Promise<void>;

export const asyncHandler = (fn: AuthenticatedHandler): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
