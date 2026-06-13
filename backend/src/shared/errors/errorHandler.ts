import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from './AppError';
import { ErrorCodes } from './errorCodes';
import { sendError } from '../responses/apiResponse';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return sendError(res, err);
  }

  if (err instanceof ZodError) {
    return sendError(res, new AppError(
      ErrorCodes.VALIDATION_ERROR,
      400,
      'Invalid request body',
      err.issues,
    ));
  }

  console.error(err);
  return sendError(res, new AppError(ErrorCodes.INTERNAL_ERROR, 500, 'Internal server error'));
};
