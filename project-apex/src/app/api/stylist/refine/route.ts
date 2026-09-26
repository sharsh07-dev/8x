import { NextResponse } from 'next/server';
import { RefineRequestSchema } from '@/lib/stylist/types';
import { extractFashionIntent } from '@/lib/stylist/intent-extractor';
import { retrieveProducts } from '@/lib/stylist/retrieval';
import { buildOutfitLooks, generateExplanation } from '@/lib/stylist/outfit-builder';
import { getSession, updateSession, addMessageToSession } from '@/lib/stylist/session';
import { FashionIntent } from '@/lib/stylist/types';

// ═══════════════════════════════════════════════════════════
// POST /api/stylist/refine
//
// Context-aware refinement — merges new intent over session intent.
// "Make it black" → only updates colors, keeps occasion/budget.
// "Under ₹2000" → only updates budget_max, keeps everything else.
// ═══════════════════════════════════════════════════════════

function mergeIntent(existing: FashionIntent, update: FashionIntent): FashionIntent {
  return {
    ...existing,
    // Only override fields that changed from null to a value
    occasion: update.occasion ?? existing.occasion,
    dress_code: update.dress_code ?? existing.dress_code,
    gender: update.gender ?? existing.gender,
    fit: update.fit ?? existing.fit,
    season: update.season ?? existing.season,
    size: update.size ?? existing.size,
    formality: update.formality ?? existing.formality,
    budget_min: update.budget_min ?? existing.budget_min,
    budget_max: update.budget_max ?? existing.budget_max,
    outfit_mode: update.outfit_mode ?? existing.outfit_mode,
    // Arrays: append new, deduplicate
    colors: update.colors.length > 0 ? update.colors : existing.colors,
    styles: [...new Set([...existing.styles, ...update.styles])],
    avoid: [...new Set([...existing.avoid, ...update.avoid])],
    preferred_categories: update.preferred_categories.length > 0
      ? update.preferred_categories
      : existing.preferred_categories,
    // Explanation
    clarification_needed: update.clarification_needed,
    clarification_question: update.clarification_question,
    reasoning_summary: update.reasoning_summary,
    language: update.language ?? existing.language,
    confidence: Math.max(existing.confidence, update.confidence),
  };
}

export async function POST(req: Request) {
  const requestId = `ref-${Date.now()}`;

  try {
    const body = await req.json();
    const parsed = RefineRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
    }
    const { message, sessionId } = parsed.data;

    const session = getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session expired. Please start a new conversation.' },
        { status: 404 }
      );
    }

    addMessageToSession(session.id, 'user', message);

    // Extract only the refinement delta
    const { intent: deltaIntent, provider } = await extractFashionIntent(
      message,
      session.messages.slice(-6)
    );

    // Merge delta over existing session intent
    const mergedIntent = session.intent
      ? mergeIntent(session.intent, deltaIntent)
      : deltaIntent;

    updateSession(session.id, { intent: mergedIntent });

    // Same smart upgrade as /recommend: occasion → complete_outfit
    if (
      mergedIntent.occasion &&
      mergedIntent.outfit_mode === 'single_item' &&
      !/\b(just|only|one|single|a shirt|a top|a dress|shoes|bag)\b/i.test(message)
    ) {
      mergedIntent.outfit_mode = 'complete_outfit';
    }

    // Re-run pipeline with merged intent
    const [individualProducts, looks] = await Promise.all([
      mergedIntent.outfit_mode !== 'complete_outfit'
        ? retrieveProducts(mergedIntent, 12)
        : Promise.resolve([]),
      mergedIntent.outfit_mode === 'complete_outfit' || mergedIntent.outfit_mode === 'alternatives'
        ? buildOutfitLooks(mergedIntent, 3)
        : Promise.resolve([]),
    ]);

    const reasoningSummary = await generateExplanation(
      looks, individualProducts, mergedIntent, message
    );

    addMessageToSession(session.id, 'assistant', reasoningSummary);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      intent: mergedIntent,
      looks,
      individualProducts,
      reasoningSummary,
      clarificationQuestion: mergedIntent.clarification_needed ? mergedIntent.clarification_question : null,
      isRefined: true,
      _meta: { requestId, provider },
    });

  } catch (error: any) {
    console.error(`[Stylist /refine] Error (${requestId}):`, error);
    return NextResponse.json(
      { success: false, message: 'Something went wrong.', requestId },
      { status: 500 }
    );
  }
}
