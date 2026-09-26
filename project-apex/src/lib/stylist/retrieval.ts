import { PrismaClient } from '@prisma/client';
import { FashionIntent, StylistProduct } from './types';
import { LLM_CONFIG } from './config';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════
// PEHNO STYLIST — Product Retrieval Engine (Phase 5)
//
// Hybrid retrieval: structured DB filters + scoring.
// Phase 3 will add vector similarity on top of this.
// ═══════════════════════════════════════════════════════════

// ─── Color Compatibility Map ─────────────────────────────────
// Deterministic — never rely on LLM for color rules
const COLOR_COMPAT: Record<string, string[]> = {
  black:  ['white', 'grey', 'beige', 'cream', 'blue', 'navy', 'red'],
  white:  ['black', 'navy', 'grey', 'blue', 'beige', 'brown', 'green'],
  navy:   ['white', 'beige', 'grey', 'brown', 'cream'],
  grey:   ['black', 'white', 'navy', 'blue', 'beige'],
  blue:   ['white', 'grey', 'brown', 'beige', 'navy'],
  brown:  ['beige', 'cream', 'white', 'navy', 'olive'],
  beige:  ['white', 'brown', 'navy', 'black', 'olive'],
  cream:  ['navy', 'brown', 'beige', 'olive', 'black'],
  green:  ['white', 'beige', 'brown', 'black'],
  olive:  ['white', 'beige', 'brown', 'cream', 'black'],
  red:    ['black', 'white', 'grey', 'navy', 'beige'],
  maroon: ['white', 'beige', 'navy', 'grey'],
  pink:   ['white', 'beige', 'grey', 'navy'],
};

// ─── Occasion → Formality Range ─────────────────────────────
const OCCASION_FORMALITY: Record<string, [number, number]> = {
  wedding:  [0.8, 1.0],
  office:   [0.7, 0.95],
  date:     [0.5, 0.75],
  party:    [0.4, 0.75],
  college:  [0.1, 0.45],
  vacation: [0.0, 0.35],
  gym:      [0.0, 0.20],
};

// ─── Build Prisma WHERE clause from intent ────────────────────
function buildProductFilters(intent: FashionIntent, role?: string): Record<string, any> {
  const where: Record<string, any> = {
    status: 'ACTIVE',
    // CRITICAL: Stylist ONLY returns fashion/clothing products.
    // garmentRole is only set on clothing items in the seed.
    // This single filter eliminates electronics, cables, kitchenware, etc.
    garmentRole: { not: null },
  };

  // HARD: Budget (never override)
  if (intent.budget_max !== null && intent.budget_max !== undefined) {
    where.price = { ...where.price, lte: intent.budget_max };
  }
  if (intent.budget_min !== null && intent.budget_min !== undefined) {
    where.price = { ...where.price, gte: intent.budget_min };
  }

  // HARD: Colors explicitly requested
  if (intent.colors.length > 0) {
    where.colorFamily = {
      in: intent.colors.map(c => c.toLowerCase())
    };
  }

  // HARD: Specific garment role for outfit building
  if (role) {
    where.garmentRole = role; // override the { not: null } with specific role
  }

  // HARD: Occasion tag match (soft-boost but also hard-filter when occasion is set)
  // We DON'T hard-filter by occasion here (would be too restrictive) — 
  // instead we score it in rankProduct. This keeps fallback broad enough.

  // HARD: In stock
  where.inventory = { stock: { gt: 0 } };

  return where;
}

// ─── Score a single product against intent ───────────────────
function scoreProduct(
  product: any,
  intent: FashionIntent,
  w = LLM_CONFIG.rankingWeights
): number {
  let score = 0;

  // 1. Occasion match (soft)
  const occasionTags: string[] = product.occasionTags || [];
  if (intent.occasion && occasionTags.includes(intent.occasion)) {
    score += w.occasionMatch;
  }

  // 2. Style match (soft)
  const styleTags: string[] = product.styleTags || [];
  const styleMatches = intent.styles.filter(s => styleTags.includes(s)).length;
  const styleScore = intent.styles.length > 0 ? styleMatches / intent.styles.length : 0;
  score += styleScore * w.styleMatch;

  // 3. Budget fit (soft — how well the price fits budget)
  if (intent.budget_max) {
    const priceFit = 1 - Math.min(product.price / intent.budget_max, 1);
    score += priceFit * w.budgetFit;
  } else {
    score += 0.5 * w.budgetFit; // neutral if no budget
  }

  // 4. Color compatibility (soft)
  if (intent.colors.length > 0 && product.colorFamily) {
    const colorIsRequested = intent.colors.includes(product.colorFamily);
    if (colorIsRequested) {
      score += w.colorCompatibility;
    }
  } else {
    score += 0.5 * w.colorCompatibility; // neutral
  }

  // 5. Formality match (soft)
  if (intent.occasion && product.formalityScore !== null && product.formalityScore !== undefined) {
    const range = OCCASION_FORMALITY[intent.occasion];
    if (range) {
      const [minF, maxF] = range;
      const inRange = product.formalityScore >= minF && product.formalityScore <= maxF;
      score += inRange ? w.attributeMatch : 0;
    }
  }

  // 6. Availability (hard already filtered, but boost fully stocked items)
  const stockScore = Math.min((product.inventory?.stock || 1) / 50, 1);
  score += stockScore * w.availabilityScore;

  return Math.round(score * 100) / 100;
}

// ─── Format DB product to StylistProduct ─────────────────────
function formatProduct(product: any, matchScore: number, intent: FashionIntent): StylistProduct {
  const explanation: string[] = [];

  if (intent.occasion && (product.occasionTags || []).includes(intent.occasion)) {
    explanation.push(`✓ Perfect for ${intent.occasion}`);
  }
  if (intent.budget_max && product.price <= intent.budget_max) {
    explanation.push(`✓ Within your ₹${intent.budget_max.toLocaleString()} budget`);
  }
  if (intent.colors.length > 0 && intent.colors.includes(product.colorFamily)) {
    explanation.push(`✓ ${product.colorFamily} as requested`);
  }
  if (product.inventory?.stock <= 5 && product.inventory?.stock > 0) {
    explanation.push(`⚡ Only ${product.inventory.stock} left in stock`);
  }
  if (matchScore >= 0.7) {
    explanation.push(`✓ Strong style match`);
  }

  return {
    id: product.id,
    title: product.title,
    price: product.price,
    originalPrice: product.compareAtPrice,
    category: product.category?.name || '',
    garmentRole: product.garmentRole,
    colorFamily: product.colorFamily,
    image: product.images?.[0]?.url || '',
    stock: product.inventory?.stock || 0,
    inStock: (product.inventory?.stock || 0) > 0,
    styleTags: product.styleTags || [],
    occasionTags: product.occasionTags || [],
    matchScore,
    explanation,
  };
}

// ─── Retrieve candidates from DB ─────────────────────────────
async function fetchCandidates(where: Record<string, any>, limit = 50): Promise<any[]> {
  return prisma.product.findMany({
    where,
    take: limit,
    include: {
      images: { take: 1 },
      category: true,
      inventory: true,
    },
  });
}

// ─── Main retrieval function ──────────────────────────────────
export async function retrieveProducts(
  intent: FashionIntent,
  limit = 10
): Promise<StylistProduct[]> {
  const where = buildProductFilters(intent);

  // Fetch up to 100 candidates from DB
  let candidates = await fetchCandidates(where, 100);

  // If results too few with hard color filter, relax it
  if (candidates.length < 5 && intent.colors.length > 0) {
    const relaxedWhere = buildProductFilters(intent);
    delete relaxedWhere.colorFamily; // remove color hard constraint
    const relaxed = await fetchCandidates(relaxedWhere, 100);
    candidates = [...candidates, ...relaxed.filter(r => !candidates.find(c => c.id === r.id))];
  }

  // Score and rank
  const scored = candidates.map(p => ({
    product: p,
    score: scoreProduct(p, intent),
  }));

  scored.sort((a, b) => b.score - a.score);

  // Diversity: avoid near-identical products
  const seen = new Set<string>();
  const diverse: StylistProduct[] = [];

  for (const { product, score } of scored) {
    const key = `${product.garmentRole}-${product.colorFamily}`;
    if (!seen.has(key) || diverse.length < 3) {
      seen.add(key);
      diverse.push(formatProduct(product, score, intent));
    }
    if (diverse.length >= limit) break;
  }

  return diverse;
}

// ─── Retrieve for a specific garment role (outfit building) ───
export async function retrieveForRole(
  intent: FashionIntent,
  role: string,
  excludeIds: string[] = [],
  limit = 3
): Promise<StylistProduct[]> {
  const where = buildProductFilters(intent, role);
  if (excludeIds.length > 0) {
    where.id = { notIn: excludeIds };
  }

  const candidates = await fetchCandidates(where, 30);
  const scored = candidates
    .map(p => ({ product: p, score: scoreProduct(p, intent) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ product, score }) => formatProduct(product, score, intent));
}

// ─── Find compatible items for outfit building ────────────────
export async function findCompatibleItems(
  primaryProduct: StylistProduct,
  targetRole: string,
  intent: FashionIntent
): Promise<StylistProduct[]> {
  const where: Record<string, any> = {
    status: 'ACTIVE',
    garmentRole: targetRole,
    inventory: { stock: { gt: 0 } },
  };

  // Budget: remaining budget after primary item
  if (intent.budget_max) {
    where.price = { lte: intent.budget_max - primaryProduct.price };
  }

  // Compatible colors
  if (primaryProduct.colorFamily && COLOR_COMPAT[primaryProduct.colorFamily]) {
    where.colorFamily = { in: COLOR_COMPAT[primaryProduct.colorFamily] };
  }

  const candidates = await fetchCandidates(where, 20);
  const scored = candidates
    .map(p => ({ product: p, score: scoreProduct(p, intent) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map(({ product, score }) => formatProduct(product, score, intent));
}
