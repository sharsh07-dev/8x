import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email';

export const baseAuth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || 'apex-dev-fallback-secret-2026-xyz',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    async sendResetPassword({ user, url, token }, request) {
      console.log('[Auth] Password reset URL:', url);
      await sendPasswordResetEmail(user.email, url);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url, token }, request) {
      console.log('[Auth] Verification URL:', url);
      await sendVerificationEmail(user.email, url);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

import { verifyFirebaseIdToken, syncFirebaseUserToDatabase } from '@/lib/firebase-admin';

// Unified Server Authorization Provider supporting Firebase and Session Cookies
export const auth = {
  ...baseAuth,
  api: {
    ...baseAuth.api,
    getSession: async (options: { headers: Headers }) => {
      const headers = options.headers;
      
      // 1. Check Authorization Bearer token (Firebase ID token)
      const authHeader = headers.get('authorization') || headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const identity = await verifyFirebaseIdToken(token);
        if (identity) {
          const user = await syncFirebaseUserToDatabase(identity);
          return {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              firebaseUid: user.firebaseUid,
              emailVerified: user.emailVerified,
              image: user.image,
            },
            session: {
              id: `fb-${user.id}`,
              userId: user.id,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          };
        }
      }

      // 2. Check apex_firebase_session cookie
      const cookieHeader = headers.get('cookie') || '';
      const match = cookieHeader.match(/apex_firebase_session=([^;]+)/);
      if (match && match[1]) {
        try {
          const decodedCookie = decodeURIComponent(match[1]);
          const payload = JSON.parse(Buffer.from(decodedCookie, 'base64').toString('utf-8'));
          if (payload.userId) {
            const user = await prisma.user.findUnique({
              where: { id: payload.userId },
            });
            if (user) {
              return {
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  firebaseUid: user.firebaseUid,
                  emailVerified: user.emailVerified,
                  image: user.image,
                },
                session: {
                  id: `fb-cookie-${user.id}`,
                  userId: user.id,
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
              };
            }
          }
        } catch {
          // Ignore parse errors and fallback
        }
      }

      // 3. Fallback to BetterAuth session
      return baseAuth.api.getSession(options);
    },
  },
};

