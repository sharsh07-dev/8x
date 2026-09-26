import { StylistSession } from './types';

// ═══════════════════════════════════════════════════════════
// PEHNO STYLIST — Session Manager (In-Memory + localStorage)
//
// Stores conversation context within a session so the user
// can refine ("Make it black", "Under ₹2000") without
// losing context.
// ═══════════════════════════════════════════════════════════

// Server-side in-memory store (15min TTL per session)
const sessionStore = new Map<string, StylistSession & { expiry: number }>();
const SESSION_TTL_MS = 15 * 60 * 1000; // 15 minutes

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [id, session] of sessionStore.entries()) {
    if (session.expiry < now) {
      sessionStore.delete(id);
    }
  }
}

export function createSession(sessionId?: string): StylistSession {
  cleanExpiredSessions();
  const id = sessionId ?? `stylist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const session: StylistSession = {
    id,
    messages: [],
    intent: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sessionStore.set(id, { ...session, expiry: Date.now() + SESSION_TTL_MS });
  return session;
}

export function getSession(sessionId: string): StylistSession | null {
  const session = sessionStore.get(sessionId);
  if (!session || session.expiry < Date.now()) {
    sessionStore.delete(sessionId);
    return null;
  }
  return session;
}

export function updateSession(
  sessionId: string,
  updates: Partial<Pick<StylistSession, 'messages' | 'intent'>>
): StylistSession | null {
  const session = sessionStore.get(sessionId);
  if (!session) return null;

  const updated = {
    ...session,
    ...updates,
    updatedAt: new Date().toISOString(),
    expiry: Date.now() + SESSION_TTL_MS, // refresh TTL
  };
  sessionStore.set(sessionId, updated);
  return updated;
}

export function addMessageToSession(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
): void {
  const session = sessionStore.get(sessionId);
  if (!session) return;
  session.messages.push({ role, content });
  session.expiry = Date.now() + SESSION_TTL_MS;
  sessionStore.set(sessionId, session);
}
