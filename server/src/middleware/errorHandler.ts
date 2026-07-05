import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code: string | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  }

  // Log error
  if (statusCode >= 500) {
    logger.error({
      err,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: (req as any).user?.userId,
    }, 'Server error');
  } else {
    logger.warn({
      err: { message: err.message, statusCode },
      method: req.method,
      url: req.url,
    }, 'Client error');
  }

  res.status(statusCode).json({
    error: message,
    code,
    ...(config.isDev && {
      stack: err.stack,
      details: err.message,
    }),
  });
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
};
