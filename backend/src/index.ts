import { buildServer } from './api/server';
import { logger } from './config/logger';
import { connectDb } from './config/database';
import { connectRedis } from './config/redis';
import { initQueue } from './config/queue';
import { registerJobs } from './jobs';

async function bootstrap() {
  try {
    await connectDb();
    logger.info('Database connected');

    await connectRedis();

    const queue = await initQueue();

    if (queue) {
      await registerJobs(queue);
    }

    const server = await buildServer();
    const address = await server.listen({
      port: parseInt(process.env.PORT || '3000'),
      host: '0.0.0.0'
    });

    logger.info(`Server listening on ${address}`);

    const shutdown = async () => {
      logger.info('Shutting down...');
      await server.close();
      if (queue) await queue.close();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();
