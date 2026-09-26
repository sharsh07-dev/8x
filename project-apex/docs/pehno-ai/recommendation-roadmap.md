# PEHNO STYLIST - Recommendation Roadmap

The AI implementation will strictly follow a 12-phase roadmap to ensure the existing store remains stable and performant.

## PHASE 0 — AUDIT PEHNO (COMPLETED)
- Analyzed PostgreSQL, Prisma, Next.js architecture, and current dummy recommendation logic.

## PHASE 1 — PRODUCT DATA PREPARATION
- Extend Prisma `Product` schema with `styleTags`, `occasionTags`, `formalityScore`, and `colorFamily`.
- Migrate mock data into the real PostgreSQL catalog.

## PHASE 2 — PRODUCT SEARCH API
- Build deterministic filtering logic (Price, Category, Size, Stock).

## PHASE 3 — EMBEDDING PIPELINE
- Enable `pgvector` in PostgreSQL.
- Implement background job to generate canonical product text -> Embeddings via OpenAI `text-embedding-3-small`.

## PHASE 4 — INTENT EXTRACTION
- Build LLM call utilizing `zod` for Structured Outputs to convert user messages into typed `FashionIntent`.

## PHASE 5 — HYBRID RETRIEVAL
- Combine `pgvector` semantic search with hard constraints (stock, price, gender).

## PHASE 6 — RANKING ENGINE
- Implement deterministic weighted scoring (Semantic + Occasion + Style + Budget).

## PHASE 7 — OUTFIT COMPATIBILITY
- Build deterministic graph rules matching `TOP` with compatible `BOTTOM` based on color and formality rules.

## PHASE 8 — PEHNO STYLIST UI
- Build the dedicated conversational interface and beautiful outfit cards.

## PHASE 9 — PERSONALIZATION
- Add `UserPreferences` schema. Modify Ranking Engine to boost items matching user preferences.

## PHASE 10 — EVENT TRACKING
- Log interactions (impression, click, ATC) to `EventStore` for future ML training.

## PHASE 11 — ML RANKING & PHASE 12 — A/B TESTING
- Long-term roadmap: Train a Learning-to-Rank model (XGBoost) and set up A/B testing infrastructure.
