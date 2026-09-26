import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from './logger';

const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

export const connectRedis = async () => {
  try {
    await redis.connect();
  } catch (error) {
    logger.warn('Could not connect to Redis, continuing without cache.');
  }
};

export default redis;
