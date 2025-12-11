/**
 * Error Handler Middleware
 * Centralized error handling for Express
 */

import { Request, Response, NextFunction } from 'express';

import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Request error', {
    method: req.method,
    path: req.path,
    statusCode,
    message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: err.name || 'Error',
    message,
    ...(process.env['NODE_ENV'] === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
