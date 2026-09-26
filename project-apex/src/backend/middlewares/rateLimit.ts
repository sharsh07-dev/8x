import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../utils/redis';
import { Request } from 'express';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 min per IP in production
  message: {
    success: false,
    error: {
      code: 429,
      message: 'Too many requests from this IP, please try again after 15 minutes',
    },
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  // Skip rate limiting for localhost during development/load testing
  skip: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || '';
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  },
  store: new RedisStore({
    // @ts-expect-error - RedisReply is compatible with ioredis return type
    sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)),
  }),
});

// Stricter limiter for sensitive auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // Only 20 auth attempts per 15 min per IP
  message: {
    success: false,
    error: { code: 429, message: 'Too many authentication attempts. Please try again later.' }
  },
  standardHeaders: true,
  legacyHeaders: false,
});
