import { FashionIntent, OutfitLook, StylistProduct } from './types';
import { retrieveForRole, findCompatibleItems } from './retrieval';

// ═══════════════════════════════════════════════════════════
// PEHNO STYLIST — Outfit Builder (Phase 7)
//
// Builds complete "looks" from individual retrieved products.
// Uses deterministic role-based assembly + color compatibility.
// ═══════════════════════════════════════════════════════════

// Outfit templates by occasion
const OUTFIT_TEMPLATES: Record<string, string[][]> = {
  date:     [['TOP', 'BOTTOM'], ['TOP', 'BOTTOM', 'FOOTWEAR']],
  office:   [['TOP', 'BOTTOM', 'FOOTWEAR']],
  college:  [['TOP', 'BOTTOM'], ['TOP', 'BOTTOM', 'FOOTWEAR']],
  party:    [['TOP', 'BOTTOM'], ['ONE_PIECE']],
  wedding:  [['TOP', 'BOTTOM', 'FOOTWEAR', 'ACCESSORY'], ['ONE_PIECE']],
  vacation: [['TOP', 'BOTTOM', 'FOOTWEAR'], ['TOP', 'BOTTOM']],
  gym:      [['TOP', 'BOTTOM']],
};

const DEFAULT_TEMPLATE = [['TOP', 'BOTTOM'], ['TOP', 'BOTTOM', 'FOOTWEAR']];

const LOOK_NAMES: Record<string, string[]> = {
  date:     ['Clean & Confident', 'Relaxed Charmer', 'Evening Edge'],
  office:   ['Power Presence', 'Sharp & Professional', 'Refined Classic'],
  college:  ['Campus Cool', 'Street-Ready', 'Casual Classic'],
  party:    ['Night Energy', 'Bold Statement', 'Party Ready'],
  wedding:  ['Celebration Royale', 'Elegant & Festive', 'Grand Look'],
  vacation: ['Vacation Mode', 'Breezy Traveller', 'Holiday Chic'],
  gym:      ['Performance Pack', 'Workout Ready'],
};

const DEFAULT_LOOK_NAMES = ['Signature Look', 'Alternative Look', 'Complete Look'];

function getLookName(occasion: string | null, index: number): string {
  if (!occasion) return DEFAULT_LOOK_NAMES[index] ?? `Look ${index + 1}`;
  const names = LOOK_NAMES[occasion] ?? DEFAULT_LOOK_NAMES;
  return names[index] ?? `${occasion} Look ${index + 1}`;
}

function getLookDescription(occasion: string | null, roles: string[]): string {
  const roleDesc = roles.join(' + ').toLowerCase();
  if (!occasion) return `A complete ${roleDesc} combination.`;
  return `A ${occasion}-ready look combining ${roleDesc} styled for the occasion.`;
}

// Build one look given a template of roles
async function buildOneLook(
  intent: FashionIntent,
  roles: string[],
  lookIndex: number,
  usedProductIds: Set<string>
): Promise<OutfitLook | null> {
  const lookProducts: OutfitLook['products'] = [];
  let totalPrice = 0;
  const lookUsedIds: string[] = [];

  for (const role of roles) {
    const candidates = await retrieveForRole(intent, role, [...usedProductIds, ...lookUsedIds], 5);
    if (candidates.length === 0) continue; // skip missing roles (not all inventory has all roles)

    // Pick the best scoring product
    const pick = candidates[0];
    lookProducts.push({
      product: pick,
      role,
      matchScore: pick.matchScore,
      explanation: pick.explanation,
    });
    totalPrice += pick.price;
    lookUsedIds.push(pick.id);
  }

  if (lookProducts.length === 0) return null;

  // Mark all used
  lookUsedIds.forEach(id => usedProductIds.add(id));

  const occasion = intent.occasion;
  return {
    id: `look-${lookIndex + 1}`,
    name: getLookName(occasion, lookIndex),
    description: getLookDescription(occasion, roles),
    totalPrice: Math.round(totalPrice),
    products: lookProducts,
  };
}

// ─── Main outfit builder ───────────────────────────────────────
export async function buildOutfitLooks(
  intent: FashionIntent,
  maxLooks = 3
): Promise<OutfitLook[]> {
  const templates = OUTFIT_TEMPLATES[intent.occasion ?? ''] ?? DEFAULT_TEMPLATE;
  const usedProductIds = new Set<string>();
  const looks: OutfitLook[] = [];

  for (let i = 0; i < Math.min(maxLooks, templates.length + 1); i++) {
    const template = templates[i % templates.length];
    const look = await buildOneLook(intent, template, i, usedProductIds);
    if (look && look.products.length >= 1) {
      // Budget check for the whole look
      if (intent.budget_max && look.totalPrice > intent.budget_max * 1.2) {
        // 20% tolerance — if whole outfit wildly over budget, skip this look
        continue;
      }
      looks.push(look);
    }
    if (looks.length >= maxLooks) break;
  }

  return looks;
}

// ─── Generate AI explanation for a set of products ────────────
export async function generateExplanation(
  looks: OutfitLook[],
  individualProducts: StylistProduct[],
  intent: FashionIntent,
  userMessage: string
): Promise<string> {
  // For now, we generate a deterministic explanation from the intent.
  // Phase 8 UI can optionally make a separate Gemini call for a
  // more personalized explanation if needed.
  
  const parts: string[] = [];

  if (intent.occasion) {
    parts.push(`perfect for your ${intent.occasion}`);
  }
  if (intent.budget_max) {
    parts.push(`within your ₹${intent.budget_max.toLocaleString()} budget`);
  }
  if (intent.colors.length > 0) {
    parts.push(`in ${intent.colors.join(', ')} tones`);
  }
  if (intent.styles.length > 0) {
    parts.push(`with a ${intent.styles[0]} aesthetic`);
  }

  if (looks.length > 0) {
    const productCount = looks.reduce((sum, l) => sum + l.products.length, 0);
    return `I've curated ${looks.length} complete ${looks.length > 1 ? 'looks' : 'look'} with ${productCount} pieces — ${parts.join(', ')}. Each outfit is assembled using real Pehno inventory, available right now.`;
  }

  if (individualProducts.length > 0) {
    return `Here are ${individualProducts.length} items I've selected from Pehno — ${parts.join(', ')}. All in stock and ready to ship.`;
  }

  return `I searched our current inventory based on your request${parts.length > 0 ? ' — ' + parts.join(', ') : ''}.`;
}
