import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// PEHNO STYLIST — Structured Intent Schema (Phase 4)
// Source of truth for what a user "means" when they ask
// for a fashion recommendation.
// ═══════════════════════════════════════════════════════════

export const FashionIntentSchema = z.object({
  occasion: z.string().nullable().describe(
    'The occasion/event e.g. date, wedding, office, college, party, vacation, gym'
  ),
  activity: z.string().nullable().describe(
    'Specific activity if mentioned e.g. hiking, swimming, clubbing'
  ),
  dress_code: z.string().nullable().describe(
    'Implied dress code e.g. formal, smart_casual, casual, traditional'
  ),
  season: z.string().nullable().describe(
    'Season if mentioned or implied: summer, winter, monsoon, spring'
  ),
  weather: z.string().nullable().describe(
    'Weather if mentioned: hot, cold, rainy'
  ),
  gender: z.enum(['Men', 'Women', 'Unisex']).nullable().describe(
    'Target gender inferred from query or context'
  ),
  preferred_categories: z.array(z.string()).describe(
    'Garment categories wanted e.g. shirt, jeans, kurta, shoes'
  ),
  colors: z.array(z.string()).describe(
    'Colors explicitly requested'
  ),
  styles: z.array(z.string()).describe(
    'Style descriptors e.g. minimal, oversized, vintage, streetwear'
  ),
  fit: z.string().nullable().describe(
    'Fit preference: slim, regular, relaxed, oversized'
  ),
  budget_min: z.number().nullable().describe(
    'Minimum price in INR if mentioned'
  ),
  budget_max: z.number().nullable().describe(
    'Maximum price in INR. ALWAYS extract "under X" or "below X" patterns'
  ),
  brand_preferences: z.array(z.string()).describe(
    'Preferred brands if mentioned'
  ),
  avoid: z.array(z.string()).describe(
    'Things explicitly to avoid e.g. flashy, very formal, red'
  ),
  size: z.string().nullable().describe(
    'Size if mentioned: XS, S, M, L, XL, XXL, or waist/chest measurements'
  ),
  location: z.string().nullable().describe(
    'Location context if mentioned: Goa, office, wedding hall, beach'
  ),
  time_of_day: z.string().nullable().describe(
    'Time context: morning, evening, night'
  ),
  outfit_mode: z.enum(['complete_outfit', 'single_item', 'alternatives']).describe(
    'Whether to build a complete outfit or recommend individual items'
  ),
  formality: z.number().min(0).max(1).nullable().describe(
    'Implied formality on scale 0.0 (very casual) to 1.0 (very formal)'
  ),
  language: z.string().describe(
    'Detected language of the user query: "en", "hi", or "hinglish"'
  ),
  confidence: z.number().min(0).max(1).describe(
    'Confidence score for this intent extraction 0.0 to 1.0'
  ),
  clarification_needed: z.boolean().describe(
    'Whether a follow-up question is needed to improve recommendations'
  ),
  clarification_question: z.string().nullable().describe(
    'The single most important follow-up question if clarification_needed is true'
  ),
  reasoning_summary: z.string().describe(
    'Short explanation of what the user wants (shown to user)'
  ),
});

export type FashionIntent = z.infer<typeof FashionIntentSchema>;

// ═══════════════════════════════════════════════════════════
// API Request/Response types
// ═══════════════════════════════════════════════════════════

export const StylistRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
  context: z.object({
    gender: z.string().optional(),
    size: z.string().optional(),
  }).optional(),
});
export type StylistRequest = z.infer<typeof StylistRequestSchema>;

export const RefineRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string(),
});
export type RefineRequest = z.infer<typeof RefineRequestSchema>;

export interface StylistProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  category: string;
  garmentRole?: string | null;
  colorFamily?: string | null;
  image: string;
  stock: number;
  inStock: boolean;
  styleTags: string[];
  occasionTags: string[];
  matchScore: number;
  explanation: string[];
}

export interface OutfitLook {
  id: string;
  name: string;
  description: string;
  totalPrice: number;
  products: Array<{
    product: StylistProduct;
    role: string;
    matchScore: number;
    explanation: string[];
  }>;
}

export interface StylistSession {
  id: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  intent: FashionIntent | null;
  createdAt: string;
  updatedAt: string;
}

export interface StylistResponse {
  sessionId: string;
  intent: FashionIntent;
  looks: OutfitLook[];
  individualProducts: StylistProduct[];
  reasoningSummary: string;
  clarificationQuestion?: string | null;
  isRefined: boolean;
}
