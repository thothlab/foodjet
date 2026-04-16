import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './errors.js';
import { logger } from '../config/logger.js';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
  };
  correlationId?: string;
}

export function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  const correlationId = request.headers['x-correlation-id'] as string | undefined;

  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      correlationId,
    };
    reply.status(error.statusCode).send(response);
    return;
  }

  if (error instanceof ZodError) {
    const response: ErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        validationErrors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      correlationId,
    };
    reply.status(400).send(response);
    return;
  }

  logger.error({ error, correlationId, url: request.url }, 'Unhandled error');

  const response: ErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred',
    },
    correlationId,
  };
  reply.status(500).send(response);
}
