import { PrismaClient } from '@prisma/client';
import { mockProducts } from '../src/data/mockProducts';

const prisma = new PrismaClient();

// ─── Only tag garment roles for actual fashion departments ────
const FASHION_DEPTS = new Set([
  'clothing-fashion', 'clothing', 'fashion', 'shoes', 'footwear',
  'accessories', 'watches', 'bags', 'jewellery', 'luggage'
]);

function isFashion(department: string): boolean {
  return FASHION_DEPTS.has((department || '').toLowerCase());
}

function determineRole(title: string, department: string): string | null {
  if (!isFashion(department)) return null;
  const t = title.toLowerCase();
  if (/\b(t-shirt|tshirt|shirt|blouse|kurta|kurti|tunic|tank|polo|top)\b/.test(t)) return 'TOP';
  if (/\b(jeans|trouser|pant|chino|shorts|skirt|legging|palazzo|salwar)\b/.test(t)) return 'BOTTOM';
  if (/\b(shoe|sneaker|sandal|boot|slipper|loafer|heel|chappal)\b/.test(t)) return 'FOOTWEAR';
  if (/\b(watch|belt|sunglass|cap|hat|jewel|necklace|earring|bracelet|ring|bag|handbag|backpack|wallet)\b/.test(t)) return 'ACCESSORY';
  if (/\b(dress|jumpsuit|saree|sari|suit|blazer|jacket|coat|hoodie|sweatshirt|sweater|cardigan|shrug)\b/.test(t)) return 'ONE_PIECE';
  return null;
}

function determineColor(title: string): string | null {
  const t = title.toLowerCase();
  const colorMap: [string, string[]][] = [
    ['black',  ['black']],
    ['white',  ['white', 'ivory', 'off-white', 'cream']],
    ['grey',   ['grey', 'gray', 'charcoal', 'ash']],
    ['navy',   ['navy']],
    ['blue',   ['blue', 'cobalt', 'denim', 'royal blue', 'sky blue', 'aqua']],
    ['red',    ['red', 'crimson', 'scarlet']],
    ['green',  ['green', 'olive', 'mint', 'teal', 'forest', 'sage']],
    ['brown',  ['brown', 'tan', 'camel', 'chocolate']],
    ['beige',  ['beige', 'khaki', 'nude', 'sand', 'stone']],
    ['pink',   ['pink', 'rose', 'blush', 'magenta', 'fuchsia']],
    ['yellow', ['yellow', 'mustard', 'golden', 'lemon']],
    ['orange', ['orange', 'rust', 'terracotta', 'coral']],
    ['purple', ['purple', 'violet', 'lavender', 'mauve']],
    ['maroon', ['maroon', 'burgundy', 'wine']],
  ];
  for (const [family, variants] of colorMap) {
    if (variants.some(v => t.includes(v))) return family;
  }
  return null;
}

function determineOccasionTags(title: string, department: string): string[] {
  if (!isFashion(department)) return [];
  const t = title.toLowerCase();
  const tags: string[] = [];
  if (/\b(formal|office|corporate|professional|interview|business)\b/.test(t)) { tags.push('office', 'date'); }
  if (/\b(casual|everyday|daily|regular)\b/.test(t)) { tags.push('college', 'casual'); }
  if (/\b(party|night|club|evening|cocktail)\b/.test(t)) { tags.push('party', 'date'); }
  if (/\b(ethnic|traditional|festival|wedding|kurta|salwar|saree|lehenga|sherwa)\b/.test(t)) { tags.push('wedding', 'festival'); }
  if (/\b(sports?|gym|workout|athletic|active|training|yoga|running)\b/.test(t)) { tags.push('gym', 'casual'); }
  if (/\b(beach|vacation|summer|holiday|travel|resort|linen)\b/.test(t)) { tags.push('vacation', 'casual'); }
  if (tags.length === 0) tags.push('college', 'casual');
  return [...new Set(tags)];
}

function determineStyleTags(title: string): string[] {
  const t = title.toLowerCase();
  const tags: string[] = [];
  if (/\b(slim|skinny|fitted)\b/.test(t)) tags.push('slim-fit');
  if (/\b(oversized|baggy|loose|relaxed)\b/.test(t)) tags.push('oversized');
  if (/\b(minimal|minimalist|basic|solid|plain)\b/.test(t)) tags.push('minimal');
  if (/\b(print|printed|graphic|pattern|floral)\b/.test(t)) tags.push('graphic');
  if (/\b(vintage|retro|classic)\b/.test(t)) tags.push('vintage');
  if (/\b(streetwear|street|urban|cargo)\b/.test(t)) tags.push('streetwear');
  if (/\b(ethnic|traditional|indian|embroidered|block.print)\b/.test(t)) tags.push('ethnic');
  if (tags.length === 0) tags.push('casual', 'everyday');
  return tags;
}

function determineFormalityScore(title: string, role: string | null): number {
  const t = title.toLowerCase();
  if (/\b(formal|suit|blazer|tuxedo|office|corporate|business)\b/.test(t)) return 0.85;
  if (/\b(smart|kurta|ethnic|interview|chino)\b/.test(t)) return 0.65;
  if (/\b(casual|everyday|jeans|tshirt|t-shirt|hoodie|sweatshirt)\b/.test(t)) return 0.25;
  if (/\b(gym|sports|athletic|workout|yoga|running)\b/.test(t)) return 0.05;
  if (role === 'FOOTWEAR') return 0.35;
  if (role === 'ACCESSORY') return 0.50;
  return 0.40;
}

async function main() {
  console.log('🌱 Smart Fashion Seed Script — fixing garment roles...');

  // Reset all existing products' AI metadata
  await prisma.product.updateMany({
    data: {
      garmentRole: null,
      colorFamily: null,
      styleTags: [],
      occasionTags: [],
      formalityScore: null,
      versatilityScore: null,
    }
  });
  console.log('✓ Reset existing product AI metadata');

  // Get categories and subcategories from DB — keyed by SLUG for reliable matching
  const allCategories = await prisma.category.findMany();
  const allSubcats = await prisma.subcategory.findMany();
  const catMap = new Map(allCategories.map(c => [c.slug, c.id])); // slug matches department value
  const subcatMap = new Map(allSubcats.map(s => [s.slug, s.id]));

  let updated = 0;
  let fashionCount = 0;

  for (const p of mockProducts) {
    const dept = p.department || '';
    const role = determineRole(p.title, dept);
    const color = determineColor(p.title);
    const occasionTags = determineOccasionTags(p.title, dept);
    const styleTags = determineStyleTags(p.title);
    const formalityScore = determineFormalityScore(p.title, role);
    const versatilityScore = role === 'TOP' ? 0.8 : role === 'BOTTOM' ? 0.7 : 0.5;

    // Look up by slug (dept value == category slug e.g. "clothing-fashion")
    const catId = catMap.get(dept.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const subcatId = subcatMap.get((p.subcategory || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'));

    if (!catId) continue;

    try {
      await prisma.product.upsert({
        where: { slug: p.id },
        update: {
          garmentRole: role,
          colorFamily: color,
          styleTags,
          occasionTags,
          formalityScore,
          versatilityScore,
        },
        create: {
          id: p.id,
          title: p.title.substring(0, 255),
          slug: p.id,
          description: (p.description || '').substring(0, 5000),
          price: p.price,
          compareAtPrice: p.originalPrice,
          brand: p.brand,
          categoryId: catId,
          subcategoryId: subcatId || null,
          garmentRole: role,
          colorFamily: color,
          styleTags,
          occasionTags,
          formalityScore,
          versatilityScore,
          images: p.image ? { create: [{ url: p.image }] } : undefined,
          inventory: { create: { stock: p.stock || 10 } }
        }
      });
      updated++;
      if (role) fashionCount++;
      if (updated % 200 === 0) console.log(`  Updated ${updated}...`);
    } catch (e: any) {
      // Skip constraint errors (duplicate slugs, etc.)
      if (!e.message?.includes('Unique')) console.warn(`Skipped ${p.id}: ${e.message?.substring(0, 60)}`);
    }
  }

  console.log(`\n✅ Done! Updated ${updated} products, ${fashionCount} with garment roles.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
