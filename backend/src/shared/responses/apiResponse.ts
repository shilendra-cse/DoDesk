import { Response } from 'express';
import { AppError } from '../errors/AppError';

export const sendSuccess = <T>(res: Response, data: T, status = 200, message?: string) =>
  res.status(status).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });

export const sendError = (res: Response, error: AppError) =>
  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  });
