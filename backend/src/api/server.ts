import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRoutes } from './routes/index';
import { errorHandler } from './middleware/error-handler';
import { logger as _logger } from '../config/logger';

export async function buildServer() {
  const server = Fastify({
    logger: false
  });

  // CORS
  await server.register(cors, {
    origin: (process.env.CORS_ORIGIN || '*').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  });

  // Error handler
  server.setErrorHandler(errorHandler);

  // Register routes
  await registerRoutes(server);

  return server;
}
