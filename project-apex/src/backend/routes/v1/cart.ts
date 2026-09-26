import { Router, Request, Response, NextFunction } from 'express';
import { CartController } from '../../controllers/cart.controller';
import { prisma } from '../../../lib/prisma';

import { auth } from '../../../lib/auth'; // Point to lib/auth.ts

const router = Router();

// Middleware to optionally authenticate (don't force auth, just attach user if valid session)
const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = 
      req.cookies['better-auth.session_token'] || 
      req.cookies['__Secure-better-auth.session_token'] || 
      req.cookies.apex_session;
      
    const firebaseSession = req.cookies.apex_firebase_session;

    if (sessionToken) {
      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: { user: true }
      });
      if (session && session.expiresAt > new Date()) {
        req.user = { id: session.user.id, role: 'CUSTOMER' };
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
          if (user) req.user = { id: user.id, role: 'CUSTOMER' };
        }
      } catch (e) {
        // Ignore firebase session parse error
      }
    }
  } catch (error) {
    // Ignore error, leave req.user undefined
  }
  next();
};

router.use(optionalAuth);

router.get('/', CartController.getCart);
router.post('/items', CartController.addItem);
router.put('/items/:id', CartController.updateItem);
router.delete('/items/:id', CartController.removeItem);

export default router;
