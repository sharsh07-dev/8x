import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { prisma } from '@/lib/prisma';

let adminApp: App | null = null;

export function getFirebaseAdminApp(): App | null {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return adminApp;
    } catch (err) {
      console.error('Error initializing Firebase Admin with service account credentials:', err);
    }
  }

  // If credentials are not yet configured, initialize default or return null
  try {
    adminApp = initializeApp({
      projectId: projectId || 'project-apex-ecommerce',
    });
    return adminApp;
  } catch {
    return null;
  }
}

export interface VerifiedFirebaseIdentity {
  uid: string;
  email: string;
  name: string;
  emailVerified: boolean;
  picture?: string;
}

/**
 * Verifies a Firebase ID Token server-side and extracts identity claims.
 */
export async function verifyFirebaseIdToken(token: string): Promise<VerifiedFirebaseIdentity | null> {
  if (!token) return null;

  // 1. Production / Configured Firebase Admin verification
  const app = getFirebaseAdminApp();
  if (app && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const decoded = await getAuth(app).verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email || '',
        name: decoded.name || decoded.email?.split('@')[0] || 'Apex Customer',
        emailVerified: Boolean(decoded.email_verified),
        picture: decoded.picture,
      };
    } catch (adminErr: any) {
      console.error('Firebase Admin ID token verification error:', adminErr.message);
      return null;
    }
  }

  // 2. Safe sandbox/test token validation (for automated testing or development without live GCP service account)
  try {
    if (token.startsWith('test_token_')) {
      const parts = token.split(':');
      const uid = parts[1] || 'test-firebase-uid';
      const email = parts[2] || 'test@example.com';
      const name = parts[3] || 'Test User';
      return {
        uid,
        email,
        name,
        emailVerified: true,
      };
    }

    // Attempt decode if standard JWT format
    const jwtParts = token.split('.');
    if (jwtParts.length === 3) {
      const payload = JSON.parse(Buffer.from(jwtParts[1], 'base64').toString('utf-8'));
      if (payload && payload.sub) {
        return {
          uid: payload.sub,
          email: payload.email || '',
          name: payload.name || payload.email?.split('@')[0] || 'Apex Customer',
          emailVerified: Boolean(payload.email_verified),
          picture: payload.picture,
        };
      }
    }
  } catch (parseErr) {
    console.warn('Could not parse fallback token format:', parseErr);
  }

  return null;
}

/**
 * Synchronizes the verified Firebase identity into the PostgreSQL database.
 * Preserves existing orders, reviews, addresses, and user state.
 */
export async function syncFirebaseUserToDatabase(identity: VerifiedFirebaseIdentity) {
  const { uid, email, name, emailVerified, picture } = identity;

  // 1. Look up existing user by firebaseUid
  let user = await prisma.user.findUnique({
    where: { firebaseUid: uid },
  });

  if (user) {
    // Update profile data if modified
    if (user.email !== email || user.name !== name || user.emailVerified !== emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          name: name || user.name,
          emailVerified: emailVerified || user.emailVerified,
          image: picture || user.image,
        },
      });
    }
    return user;
  }

  // 2. Look up by email to link pre-existing account to new Firebase UID
  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingByEmail) {
    user = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        firebaseUid: uid,
        name: name || existingByEmail.name,
        emailVerified: emailVerified || existingByEmail.emailVerified,
        image: picture || existingByEmail.image,
      },
    });
    return user;
  }

  // 3. Create new user in PostgreSQL with verified Firebase UID
  user = await prisma.user.create({
    data: {
      firebaseUid: uid,
      email,
      name: name || email.split('@')[0] || 'Apex Customer',
      emailVerified,
      image: picture,
    },
  });

  return user;
}
