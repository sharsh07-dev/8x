import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

import { prisma } from '../../lib/prisma';

import { auth } from '../../lib/auth'; // Point to lib/auth.ts

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = 
      req.cookies['better-auth.session_token'] || 
      req.cookies['__Secure-better-auth.session_token'] || 
      req.cookies.apex_session;
      
    const firebaseSession = req.cookies.apex_firebase_session;

    let userId = null;

    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: { user: true }
      });
      if (session && session.expiresAt > new Date()) {
        userId = session.user.id;
      }
    } else if (firebaseSession) {
      try {
        const decoded = Buffer.from(firebaseSession, 'base64').toString('utf-8');
        const payload = JSON.parse(decoded);
        const uid = payload.uid || payload.userId || payload.firebaseUid;
        if (uid) {
          let user = await prisma.user.findUnique({ where: { id: uid } });
          if (!user) {
            user = await prisma.user.findUnique({ where: { firebaseUid: uid } });
          }
          if (user) userId = user.id;
        }
      } catch (e) {
        // Ignore firebase session parse error
      }
    }

    if (!userId) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    req.user = { 
      id: userId, 
      role: 'CUSTOMER',
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (role: 'ADMIN' | 'CUSTOMER') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (req.user.role !== role && req.user.role !== 'ADMIN') {
      return next(new AppError('Forbidden. Insufficient permissions.', 403));
    }

    next();
  };
};
