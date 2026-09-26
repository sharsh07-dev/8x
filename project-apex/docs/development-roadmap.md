# Development Roadmap

Based on the SDLC model and the current audit, here is the immediate roadmap for Project Apex.

### [COMPLETED] Phase 0 — Project Discovery & Audit
- Codebase inspected, existing implementation mapped, tech debt identified.

### [NEXT] Phase 1 — Requirements & Acceptance Criteria
- Define clear requirements, acceptance criteria, and failure cases for all core flows.
- **Deliverables**: `/docs/requirements.md`, `/docs/acceptance-criteria.md`.

### [PENDING] Phase 2 — Architecture & Technical Design
- Define final technical architecture, API flow, and security constraints.
- **Deliverables**: `/docs/architecture.md`, `/docs/api-architecture.md`, etc.

### [PENDING] Phase 3 — Database & Data Model
- Add missing entities to Prisma (Product, Category, Variant, etc.).
- Establish foreign keys and index strategies.
- Execute migrations on a clean database.

### [PENDING] Phase 4 — Backend Foundation
- Solidify Express/Next.js API routes, configure global error handling, and Zod validation.

### [PENDING] Phase 5 — Authentication & User Management
- Finalize Firebase + Better Auth integration. Clean up `any` types in auth helpers.

### [PENDING] Phase 6 — Product Catalog
- Migrate away from `mockProducts.ts`. Serve products directly from PostgreSQL.

### [PENDING] Phases 7 to 27
- Follow strict sequential development for Search, Cart, Inventory, Checkout, Payments, etc., as defined in the master SDLC prompt.
