import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../../config/logger';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  logger.error('Request error', {
    url: request.url,
    method: request.method,
    error: error.message
  });

  const statusCode = error.statusCode || 500;

  reply.status(statusCode).send({
    success: false,
    error: {
      code: statusCode === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message: statusCode === 500 ? 'Internal server error' : error.message
    }
  });
}
