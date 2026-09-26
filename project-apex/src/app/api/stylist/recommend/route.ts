import { NextResponse } from 'next/server';
import { z } from 'zod';
import { StylistRequestSchema, StylistResponse } from '@/lib/stylist/types';
import { extractFashionIntent } from '@/lib/stylist/intent-extractor';
import { retrieveProducts } from '@/lib/stylist/retrieval';
import { buildOutfitLooks, generateExplanation } from '@/lib/stylist/outfit-builder';
import { createSession, getSession, updateSession, addMessageToSession } from '@/lib/stylist/session';

// ═══════════════════════════════════════════════════════════
// POST /api/stylist/recommend
//
// The main Pehno Stylist endpoint.
// Flow:
//   1. Validate request
//   2. Get or create session
//   3. Extract intent via LLM (Gemini → Grok → deterministic)
//   4. Retrieve products from PostgreSQL
//   5. Build outfit looks (if complete_outfit mode)
//   6. Generate explanation
//   7. Return structured response
// ═══════════════════════════════════════════════════════════

export async function POST(req: Request) {
  const requestId = `req-${Date.now()}`;
  const startTime = Date.now();

  try {
    const body = await req.json();

    // Step 1: Validate request
    const parsed = StylistRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid request', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { message, sessionId: incomingSessionId, context } = parsed.data;

    // Step 2: Session management
    let session = incomingSessionId ? getSession(incomingSessionId) : null;
    if (!session) {
      session = createSession(incomingSessionId);
    }
    addMessageToSession(session.id, 'user', message);

    // Step 3: Intent extraction (with conversation history for context)
    const { intent, provider } = await extractFashionIntent(
      message,
      session.messages.slice(-6) // last 3 exchanges for context
    );

    // Merge context overrides (e.g., gender from user profile)
    if (context?.gender && !intent.gender) {
      intent.gender = context.gender as any;
    }
    if (context?.size && !intent.size) {
      intent.size = context.size;
    }

    // Update session with extracted intent
    updateSession(session.id, { intent });

    // Smart upgrade: if user mentions an occasion (date, wedding, office...)
    // but didn't explicitly ask for a single item, default to complete_outfit.
    // This makes "I have a date tonight" return looks, not individual products.
    if (
      intent.occasion &&
      intent.outfit_mode === 'single_item' &&
      !/\b(just|only|one|single|a shirt|a top|a dress|shoes|bag)\b/i.test(message)
    ) {
      intent.outfit_mode = 'complete_outfit';
    }

    // Step 4 + 5: Retrieve products and build looks IN PARALLEL
    const [individualProducts, looks] = await Promise.all([
      intent.outfit_mode !== 'complete_outfit'
        ? retrieveProducts(intent, 12)
        : Promise.resolve([]),
      intent.outfit_mode === 'complete_outfit' || intent.outfit_mode === 'alternatives'
        ? buildOutfitLooks(intent, 3)
        : Promise.resolve([]),
    ]);

    // Step 6: Generate explanation
    const reasoningSummary = await generateExplanation(
      looks, individualProducts, intent, message
    );

    // Step 7: Save assistant response to session
    addMessageToSession(session.id, 'assistant', reasoningSummary);

    const latencyMs = Date.now() - startTime;

    // Step 8: Return structured response
    const response: StylistResponse = {
      sessionId: session.id,
      intent,
      looks,
      individualProducts,
      reasoningSummary,
      clarificationQuestion: intent.clarification_needed ? intent.clarification_question : null,
      isRefined: session.messages.filter(m => m.role === 'user').length > 1,
    };

    return NextResponse.json({
      success: true,
      ...response,
      _meta: { requestId, latencyMs, provider, rankingVersion: process.env.PEHNO_RANKING_VERSION },
    });

  } catch (error: any) {
    console.error(`[Stylist /recommend] Error (${requestId}):`, error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong. Please try again.', requestId },
      { status: 500 }
    );
  }
}
