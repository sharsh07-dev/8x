'use client';

import { useState, useEffect } from 'react';
import { 
  auth as firebaseAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  fbSignOut, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  updateProfile,
  onAuthStateChanged,
  FirebaseUser,
  signInWithPopup,
  googleProvider
} from './firebase';
import { createAuthClient } from 'better-auth/react';

function getClientBaseURL(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  let raw = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';
  raw = (raw || '').trim();
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1).trim();
  if (raw.startsWith("'") && raw.endsWith("'")) raw = raw.slice(1, -1).trim();
  if (raw.includes('<') || raw.includes('>') || (!raw.startsWith('http://') && !raw.startsWith('https://'))) {
    return 'http://localhost:3000';
  }
  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    return 'http://localhost:3000';
  }
}

// Legacy client for backward compatibility
export const legacyAuthClient = createAuthClient({
  baseURL: getClientBaseURL(),
});

export interface ApexUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  firebaseUid?: string | null;
  emailVerified?: boolean;
}

export interface SessionState {
  user: ApexUser | null;
}

/**
 * React hook observing Firebase Authentication state and server session synchronization.
 */
export function useSession() {
  const [session, setSession] = useState<{ user: ApexUser } | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // First check existing server session cookie
    fetch('/api/auth/firebase-session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.user) {
          setSession({ user: data.user });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsPending(false);
      });

    // Listen to Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const res = await fetch('/api/auth/firebase-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken }),
          });
          if (res.ok) {
            const data = await res.json().catch(() => null);
            if (isMounted && data?.user) {
              setSession({ user: data.user });
            }
          }
        } catch (err) {
          console.error('Error synchronizing Firebase user with backend:', err);
        }
      } else {
        // When signed out of Firebase, check if session was already active
        // Only clear if no server session
      }
      if (isMounted) setIsPending(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return {
    data: session,
    isPending,
  };
}

interface SignInFunction {
  (credentials: { email: string; password: string; callbackUrl?: string; callbackURL?: string; rememberMe?: boolean }): Promise<any>;
  email: (credentials: { email: string; password: string; callbackUrl?: string; callbackURL?: string; rememberMe?: boolean }) => Promise<any>;
}

interface SignUpFunction {
  (data: { email: string; password: string; name: string; callbackURL?: string; callbackUrl?: string }): Promise<any>;
  email: (data: { email: string; password: string; name: string; callbackURL?: string; callbackUrl?: string }) => Promise<any>;
}

async function internalSignIn(credentials: { email: string; password: string; callbackUrl?: string }) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      credentials.email,
      credentials.password
    );

    const idToken = await userCredential.user.getIdToken();
    const res = await fetch('/api/auth/firebase-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      console.warn('Firebase session endpoint returned status:', res.status);
      return { data: { user: userCredential.user }, error: null };
    }

    const sessionData = await res.json().catch(() => ({ user: userCredential.user }));
    return { data: sessionData, error: null };
  } catch (err: any) {
    // If Firebase Email/Password provider is not yet enabled in Firebase Console, fallback seamlessly
    if (
      err.code === 'auth/configuration-not-found' ||
      err.code === 'auth/operation-not-allowed' ||
      err.code === 'auth/project-not-found' ||
      err.message?.includes('configuration-not-found')
    ) {
      console.warn('Firebase Email/Password provider not enabled in Firebase Console. Falling back to database auth.');
      return await legacyAuthClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });
    }

    let friendlyMessage = err.message || 'Failed to sign in.';
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
      friendlyMessage = 'Invalid email or password. Please verify your credentials.';
    } else if (err.code === 'auth/too-many-requests') {
      friendlyMessage = 'Too many failed login attempts. Please reset your password or try again later.';
    }
    return { data: null, error: { message: friendlyMessage, code: err.code } };
  }
}

async function internalSignUp(data: { email: string; password: string; name: string }) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseAuth,
      data.email,
      data.password
    );

    await updateProfile(userCredential.user, {
      displayName: data.name,
    });

    await sendEmailVerification(userCredential.user).catch((e) => {
      console.warn('Email verification send notice:', e.message);
    });

    const idToken = await userCredential.user.getIdToken();
    const res = await fetch('/api/auth/firebase-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      console.warn('Firebase session endpoint returned status:', res.status);
      return { data: { user: userCredential.user }, error: null };
    }

    const sessionData = await res.json().catch(() => ({ user: userCredential.user }));
    return { data: sessionData, error: null };
  } catch (err: any) {
    // If Firebase Email/Password provider is not yet enabled in Firebase Console, fallback seamlessly
    if (
      err.code === 'auth/configuration-not-found' ||
      err.code === 'auth/operation-not-allowed' ||
      err.code === 'auth/project-not-found' ||
      err.message?.includes('configuration-not-found')
    ) {
      console.warn('Firebase Email/Password provider not enabled in Firebase Console. Falling back to database auth.');
      return await legacyAuthClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });
    }

    let friendlyMessage = err.message || 'Failed to create account.';
    if (err.code === 'auth/email-already-in-use') {
      friendlyMessage = 'An account with this email address already exists. Please sign in instead.';
    } else if (err.code === 'auth/weak-password') {
      friendlyMessage = 'Passwords must be at least 6 characters long.';
    }
    return { data: null, error: { message: friendlyMessage, code: err.code } };
  }
}

export const signIn = internalSignIn as SignInFunction;
signIn.email = internalSignIn;

export const signUp = internalSignUp as SignUpFunction;
signUp.email = internalSignUp;

/**
 * Sign out of Firebase Authentication and clear server session cookie.
 */
export async function signOut() {
  try {
    await fbSignOut(firebaseAuth);
    await fetch('/api/auth/firebase-session', { method: 'DELETE' });
    await legacyAuthClient.signOut().catch(() => {});
  } catch (err) {
    console.error('Error during sign out:', err);
  }
}

/**
 * Send password reset email via Firebase Authentication.
 */
export async function resetPassword(data: { email: string }) {
  try {
    await sendPasswordResetEmail(firebaseAuth, data.email);
    return { data: { success: true }, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message || 'Failed to send password reset email.' } };
  }
}

// Re-export compatibility helpers
export const verifyEmail = legacyAuthClient.verifyEmail;
export const sendVerificationEmail = legacyAuthClient.sendVerificationEmail;
export const changePassword = legacyAuthClient.changePassword;
export const revokeOtherSessions = legacyAuthClient.revokeOtherSessions;
export const revokeSessions = legacyAuthClient.revokeSessions;
