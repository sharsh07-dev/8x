import { Request, Response } from 'express';
import { verifyFirebaseIdToken, syncFirebaseUserToDatabase } from '../../lib/firebase-admin';
import { prisma } from '../../lib/prisma';
import crypto from 'crypto';
import { AppError } from '../middlewares/errorHandler';

export class AuthController {
  /**
   * Exchanges a Firebase ID token for a secure HTTP-only session cookie
   */
  static async createSession(req: Request, res: Response) {
    const { idToken } = req.body;
    if (!idToken) {
      throw new AppError('Firebase ID token is required', 400);
    }

    // 1. Verify token with Firebase Admin
    const verifiedIdentity = await verifyFirebaseIdToken(idToken);
    if (!verifiedIdentity) {
      throw new AppError('Invalid or expired Firebase ID token', 401);
    }

    // 2. Sync to Postgres Database
    const user = await syncFirebaseUserToDatabase(verifiedIdentity);

    // 3. Create Session
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
        ipAddress: req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      }
    });

    // 4. Set secure cookie
    res.cookie('apex_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      }
    });
  }

  /**
   * Logs out the user by deleting the session from DB and clearing the cookie
   */
  static async logout(req: Request, res: Response) {
    const sessionToken = req.cookies.apex_session;
    
    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { token: sessionToken }
      });
    }

    res.clearCookie('apex_session');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  /**
   * Returns the currently authenticated user's profile
   */
  static async getMe(req: Request, res: Response) {
    // req.user is populated by authMiddleware
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        phoneNumber: true,
        phoneVerified: true,
        image: true,
        createdAt: true,
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({ success: true, data: { user } });
  }

  // ================= Address Management ================= //
  
  static async getAddresses(req: Request, res: Response) {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: { isDefault: 'desc' },
    });
    res.status(200).json({ success: true, data: { addresses } });
  }

  static async addAddress(req: Request, res: Response) {
    const { fullName, street, city, state, zipCode, country, phone, isDefault, instructions } = req.body;
    
    // If this is the first address or set as default, handle default unsetting
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user!.id,
        fullName,
        street,
        city,
        state,
        zipCode,
        country: country || 'United States',
        phone,
        isDefault: isDefault || false,
        instructions
      }
    });
    res.status(201).json({ success: true, data: { address } });
  }

  static async updateAddress(req: Request, res: Response) {
    const id = req.params.id as string;
    const updateData = req.body;

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.id) {
      throw new AppError('Address not found or unauthorized', 404);
    }

    if (updateData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: updateData
    });
    res.status(200).json({ success: true, data: { address } });
  }

  static async deleteAddress(req: Request, res: Response) {
    const id = req.params.id as string;
    
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.id) {
      throw new AppError('Address not found or unauthorized', 404);
    }

    await prisma.address.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  }
}
