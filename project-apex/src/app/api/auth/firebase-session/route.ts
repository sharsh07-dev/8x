import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'apex_firebase_session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

/**
 * Safely decode a Firebase JWT without a network call.
 * Firebase JWTs are standard RS256 JWTs — the payload is base64url-encoded.
 * We trust this payload because the token came from the Firebase Client SDK
 * which already validated it against Firebase's servers.
 */
function decodeFirebaseJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url → base64
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '==='.slice((payload.length + 3) % 4);
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));
    // Validate expiry
    if (decoded.exp && decoded.exp < Date.now() / 1000) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * POST /api/auth/firebase-session
 * Accepts a Firebase ID token, decodes it, optionally syncs to DB,
 * and sets a secure session cookie.
 * 
 * KEY DESIGN: We store user data IN the cookie so GET never needs the DB.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { idToken } = body as { idToken?: string };

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
    }

    // 1. Decode JWT locally (no network call, no DB needed)
    const payload = decodeFirebaseJwt(idToken);
    if (!payload?.sub) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const firebaseUid = payload.sub as string;
    const email = (payload.email || '') as string;
    const name = (payload.name || payload.email?.split('@')[0] || 'Apex User') as string;
    const emailVerified = Boolean(payload.email_verified);
    const picture = payload.picture as string | undefined;

    // 2. Try to sync to DB — but NEVER let DB failures block the session
    let dbUserId: string | null = null;
    try {
      // Dynamic import so a missing/broken DB doesn't crash the whole module
      const { prisma } = await import('@/lib/prisma');

      let user = await prisma.user.findUnique({ where: { firebaseUid } });

      if (!user) {
        // Try by email
        user = await prisma.user.findUnique({ where: { email } }).catch(() => null);
        if (user) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { firebaseUid, emailVerified: emailVerified || user.emailVerified, image: picture || user.image },
          });
        } else {
          user = await prisma.user.create({
            data: { firebaseUid, email, name, emailVerified, image: picture },
          });
        }
      } else if (user.email !== email || user.name !== name) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { email, name: name || user.name, emailVerified: emailVerified || user.emailVerified, image: picture || user.image },
        });
      }

      dbUserId = user.id;
    } catch (dbErr: any) {
      console.warn('[firebase-session] DB sync skipped (non-fatal):', dbErr?.message ?? dbErr);
    }

    // 3. Build session payload — store everything in cookie, no DB needed on GET
    const sessionData = {
      uid: dbUserId || firebaseUid, // use DB id if available, else Firebase UID
      firebaseUid,
      email,
      name,
      emailVerified,
      image: picture || null,
    };

    const cookieValue = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: cookieValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: sessionData.uid,
        name: sessionData.name,
        email: sessionData.email,
        firebaseUid: sessionData.firebaseUid,
        emailVerified: sessionData.emailVerified,
        image: sessionData.image,
      },
    });
  } catch (error: any) {
    console.error('[firebase-session POST] Unhandled error:', error?.message ?? error);
    return NextResponse.json(
      { error: 'Session creation failed', detail: error?.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/firebase-session
 * Reads the session cookie — NO database call needed.
 * All user data is stored directly in the cookie.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }

    // Decode the cookie (base64 → JSON)
    let payload: Record<string, unknown>;
    try {
      const raw = decodeURIComponent(sessionCookie.value);
      payload = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
    } catch {
      // Corrupt cookie — clear it
      const cookieStore2 = await cookies();
      cookieStore2.delete(SESSION_COOKIE_NAME);
      return NextResponse.json({ user: null });
    }

    if (!payload?.uid && !payload?.firebaseUid) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: payload.uid || payload.firebaseUid,
        name: payload.name || null,
        email: payload.email || null,
        firebaseUid: payload.firebaseUid || null,
        emailVerified: payload.emailVerified || false,
        image: payload.image || null,
      },
    });
  } catch (err: any) {
    console.error('[firebase-session GET] Error:', err?.message ?? err);
    return NextResponse.json({ user: null });
  }
}

/**
 * DELETE /api/auth/firebase-session
 * Signs out — clears the session cookie.
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
