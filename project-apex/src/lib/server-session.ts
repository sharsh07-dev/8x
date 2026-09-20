import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'apex_firebase_session';

export interface ApexServerSession {
  user: {
    id: string;
    name: string;
    email: string;
    firebaseUid: string | null;
    emailVerified: boolean;
    image: string | null;
  };
}

/**
 * getServerSession — reads the Firebase session cookie set by /api/auth/firebase-session.
 * 
 * This is the ONLY auth check used in API routes. It never touches the database,
 * so it works even when DATABASE_URL is misconfigured or unreachable.
 * 
 * Use this instead of auth.api.getSession() everywhere.
 */
export async function getServerSession(): Promise<ApexServerSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) return null;

    const raw = decodeURIComponent(sessionCookie.value);
    const payload = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));

    const uid = payload?.uid || payload?.firebaseUid;
    if (!uid) return null;

    return {
      user: {
        id: uid,
        name: payload.name || 'Apex User',
        email: payload.email || '',
        firebaseUid: payload.firebaseUid || null,
        emailVerified: Boolean(payload.emailVerified),
        image: payload.image || null,
      },
    };
  } catch {
    return null;
  }
}
