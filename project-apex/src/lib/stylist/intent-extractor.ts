import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { FashionIntent, FashionIntentSchema } from './types';
import { LLM_CONFIG, SYSTEM_PROMPT } from './config';

// ═══════════════════════════════════════════════════════════
// PEHNO STYLIST — Intent Extractor (Phase 4)
//
// Converts natural-language user messages → structured FashionIntent
// Uses Gemini Flash as primary, Grok as fallback.
// All LLM calls are server-side only.
// ═══════════════════════════════════════════════════════════

// Gemini JSON Schema for structured output
const INTENT_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    occasion: { type: SchemaType.STRING, nullable: true },
    activity: { type: SchemaType.STRING, nullable: true },
    dress_code: { type: SchemaType.STRING, nullable: true },
    season: { type: SchemaType.STRING, nullable: true },
    weather: { type: SchemaType.STRING, nullable: true },
    gender: { type: SchemaType.STRING, nullable: true },
    preferred_categories: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    colors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    styles: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    fit: { type: SchemaType.STRING, nullable: true },
    budget_min: { type: SchemaType.NUMBER, nullable: true },
    budget_max: { type: SchemaType.NUMBER, nullable: true },
    brand_preferences: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    avoid: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    size: { type: SchemaType.STRING, nullable: true },
    location: { type: SchemaType.STRING, nullable: true },
    time_of_day: { type: SchemaType.STRING, nullable: true },
    outfit_mode: { type: SchemaType.STRING },
    formality: { type: SchemaType.NUMBER, nullable: true },
    language: { type: SchemaType.STRING },
    confidence: { type: SchemaType.NUMBER },
    clarification_needed: { type: SchemaType.BOOLEAN },
    clarification_question: { type: SchemaType.STRING, nullable: true },
    reasoning_summary: { type: SchemaType.STRING },
  },
  required: [
    'occasion', 'preferred_categories', 'colors', 'styles',
    'outfit_mode', 'language', 'confidence',
    'clarification_needed', 'reasoning_summary',
    'brand_preferences', 'avoid',
    'budget_min', 'budget_max',
  ],
};

// ─── Gemini Extraction ───────────────────────────────────────
async function extractWithGemini(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<FashionIntent> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your-gemini-api-key')) {
    throw new Error('GEMINI_API_KEY not configured — using placeholder value');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: LLM_CONFIG.model,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: INTENT_SCHEMA as any,
      temperature: 0.1, // low temp for consistent structured output
    },
    systemInstruction: SYSTEM_PROMPT,
  });

  // Build context-aware prompt
  const contextPrefix = conversationHistory.length > 0
    ? `Previous conversation context:\n${conversationHistory
        .slice(-4) // last 2 exchanges
        .map(m => `${m.role === 'user' ? 'Customer' : 'Stylist'}: ${m.content}`)
        .join('\n')}\n\nNew message: `
    : 'Customer query: ';

  const prompt = `${contextPrefix}${message}

Extract the fashion intent from this query. Follow the schema exactly.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = JSON.parse(text);

  // Validate with Zod
  return FashionIntentSchema.parse(parsed);
}

// ─── Grok Fallback Extraction ────────────────────────────────
async function extractWithGrok(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<FashionIntent> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey || apiKey === 'your-grok-api-key-here') {
    throw new Error('GROK_API_KEY not configured');
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + '\n\nRespond ONLY with valid JSON matching the FashionIntent schema. No markdown.' },
    ...conversationHistory.slice(-4).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: LLM_CONFIG.fallbackModel,
      messages,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Grok API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content;
  if (!text) throw new Error('Empty response from Grok');

  const parsed = JSON.parse(text);
  return FashionIntentSchema.parse(parsed);
}

// ─── Deterministic Fallback ──────────────────────────────────
// Used when all LLM providers are unavailable.
// Ensures the store never breaks due to AI outage.
function extractDeterministicFallback(message: string): FashionIntent {
  const lower = message.toLowerCase();

  const budgetMatch = lower.match(/(?:under|below|upto|₹|rs\.?)\s*(\d+)/i);
  const budgetMax = budgetMatch ? parseInt(budgetMatch[1]) : null;

  const isOutfit = /outfit|look|complete|what.*(wear|put on)/i.test(lower);

  const occasion = /(date|dating)/i.test(lower) ? 'date'
    : /(office|interview|meeting)/i.test(lower) ? 'office'
    : /(college|campus|university)/i.test(lower) ? 'college'
    : /(party|night out|club)/i.test(lower) ? 'party'
    : /(wedding|shaadi)/i.test(lower) ? 'wedding'
    : /(goa|beach|vacation|trip)/i.test(lower) ? 'vacation'
    : null;

  const colors = [];
  const colorNames = ['black', 'white', 'blue', 'red', 'green', 'grey', 'navy', 'beige', 'brown', 'pink'];
  for (const c of colorNames) {
    if (lower.includes(c)) colors.push(c);
  }

  return {
    occasion,
    activity: null,
    dress_code: occasion === 'office' ? 'formal' : 'casual',
    season: null,
    weather: null,
    gender: null,
    preferred_categories: [],
    colors,
    styles: [],
    fit: null,
    budget_min: null,
    budget_max: budgetMax,
    brand_preferences: [],
    avoid: [],
    size: null,
    location: null,
    time_of_day: null,
    outfit_mode: isOutfit ? 'complete_outfit' : 'single_item',
    formality: occasion === 'office' ? 0.8 : 0.4,
    language: 'en',
    confidence: 0.5,
    clarification_needed: false,
    clarification_question: null,
    reasoning_summary: `Searching for ${occasion ?? 'fashion'} items${budgetMax ? ` under ₹${budgetMax}` : ''}.`,
  };
}

// ─── Main exported extractor ──────────────────────────────────
export async function extractFashionIntent(
  message: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<{ intent: FashionIntent; provider: string }> {
  // Try Gemini first
  try {
    const intent = await extractWithGemini(message, conversationHistory);
    return { intent, provider: 'gemini' };
  } catch (geminiError: any) {
    console.warn(`[Stylist] Gemini extraction failed: ${geminiError.message}. Trying Grok...`);

    // Fallback to Grok
    try {
      const intent = await extractWithGrok(message, conversationHistory);
      return { intent, provider: 'grok' };
    } catch (grokError: any) {
      console.warn(`[Stylist] Grok extraction also failed: ${grokError.message}. Using deterministic fallback.`);

      // Deterministic fallback — store never goes down
      const intent = extractDeterministicFallback(message);
      return { intent, provider: 'deterministic' };
    }
  }
}
