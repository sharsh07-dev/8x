import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { connectRedis } from './utils/redis';
import { prisma } from '../lib/prisma';

const startServer = async () => {
  try {
    // Attempt to connect to Redis cache
    await connectRedis();

    // Verify Database connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');

    const server = app.listen(env.PORT, () => {
      logger.info(`Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await prisma.$disconnect();
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
