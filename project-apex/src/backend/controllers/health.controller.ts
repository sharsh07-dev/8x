import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export class HealthController {
  static async check(req: Request, res: Response) {
    try {
      // Basic DB check
      await prisma.$queryRaw`SELECT 1`;
      
      res.status(200).json({
        success: true,
        data: {
          status: 'ok',
          timestamp: new Date().toISOString(),
          database: 'connected',
        },
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        error: {
          code: 503,
          message: 'Service Unavailable - Database connection failed',
        },
      });
    }
  }
}
