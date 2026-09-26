# PEHNO STYLIST - Architecture Audit

## 1. Current PostgreSQL / Prisma Setup
- **Database**: PostgreSQL
- **ORM**: Prisma Client v6.4
- **Schema Status**: Highly normalized. Contains `Category`, `Subcategory`, `Product`, `ProductVariant`, `ProductImage`, and `ProductInventory`.
- **Missing for AI**: No vector extension enabled (`pgvector`). No existing metadata fields on `Product` for styling (e.g., style tags, formality scores, embeddings).

## 2. Current Product & Inventory Schema
- Products relate to exactly one Category and optionally one Subcategory/Collection.
- Variants handle price/sku differences (colors, sizes).
- Inventory is tracked in `ProductInventory` (stock, reserved).
- **Audit Finding**: To support outfit compatibility, we need an explicit taxonomy for "Wearable Role" (e.g., Top, Bottom, Footwear, Accessory).

## 3. Current Search & Recommendation API
- **Current State**: Search and recommendations (like "Trending & Inspired" or "Recommended For You") currently rely heavily on `mockProducts.ts` or basic exact-match filtering in `/api/recommendations/route.ts`.
- **Audit Finding**: True semantic search does not exist. Recommendations do not query Prisma; they filter mock arrays.

## 4. Current Authentication & Frontend
- **Auth**: Firebase Admin + better-auth + Next.js Session.
- **Frontend**: Next.js 16 (App Router) + Tailwind CSS v4 + Zustand for state management.
- **Audit Finding**: The frontend architecture is modern and ready for a dedicated chat/UI layer for Pehno Stylist. Zustand is well-suited to manage session-level styling state (e.g., tracking the current "Outfit Canvas").

## 5. Caching
- **Redis**: `ioredis` is installed and available.
- **Audit Finding**: Redis is perfect for caching frequent natural language query extractions and caching embeddings before hitting PostgreSQL.

## Next Steps
- Enable `pgvector` in the PostgreSQL database.
- Expand the `Product` Prisma model to include styling attributes.
- Transition `mockProducts.ts` data fully into PostgreSQL to allow SQL-level filtering combined with vector retrieval.
