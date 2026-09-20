import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseIdToken, syncFirebaseUserToDatabase } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'apex_firebase_session';

/**
 * POST /api/auth/firebase-session
 * Exchanges a Firebase ID token for a secure server session cookie and database sync.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'Firebase ID token is required' },
        { status: 400 }
      );
    }

    // 1. Verify ID token on server
    const identity = await verifyFirebaseIdToken(idToken);
    if (!identity) {
      return NextResponse.json(
        { error: 'Invalid or expired Firebase ID token' },
        { status: 401 }
      );
    }

    // 2. Synchronize user record in PostgreSQL database
    const user = await syncFirebaseUserToDatabase(identity);

    // 3. Set secure session cookie
    const cookieStore = await cookies();
    const sessionPayload = Buffer.from(
      JSON.stringify({
        userId: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
      })
    ).toString('base64');

    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: sessionPayload,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        firebaseUid: user.firebaseUid,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error: any) {
    console.error('Error syncing Firebase session:', error);
    return NextResponse.json(
      { error: 'Failed to create session: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/firebase-session
 * Retrieves current authenticated user session from secure cookie.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }

    const payload = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
    );

    if (!payload.userId) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        firebaseUid: true,
        emailVerified: true,
        phoneNumber: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}

/**
 * DELETE /api/auth/firebase-session
 * Clears the session cookie on sign out.
 */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.json({ success: true });
}
