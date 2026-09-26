# Technical Debt Report

## 1. Type Safety & Linting Errors
- **ESLint**: The project currently has 211 linting problems (115 errors, 96 warnings).
- **TypeScript `any`**: There is widespread use of `any` across critical files, particularly in the `src/lib/` utilities (e.g., `user-storage.ts`, `firebase.ts`, `auth.ts`, `payments/razorpay.ts`). This undermines TypeScript's guarantees and introduces runtime risks.

## 2. Hardcoded / Mock Data
- **Product Catalog**: The entire product catalog relies on `src/data/mockProducts.ts`. The UI (`src/app/products/[id]/page.tsx`) and likely some APIs are directly importing this mock data.
- **Resolution**: A complete database schema for Products, Variants, and Categories must be designed (Phase 3) and implemented (Phase 6).

## 3. Database Schema Gaps
- `schema.prisma` contains `ProductInventory` but no parent `Product` model. This is an orphaned relationship conceptually.
- Missing models for `Category`, `Subcategory`, `Collection`, `Coupon`, `Return`, `Refund`, and `Notification`.

## 4. Unused Variables & Dead Code
- Linting shows several unused variables (e.g., `amount` in `payment-adapter.ts`, `token` in `auth.ts`). This indicates code that was quickly scaffolded and not cleaned up.

## 5. Security & Secret Management
- Multiple `.env` examples exist, and some files might be pulling secrets incorrectly. 
- Hybrid authentication (Firebase + Better Auth) needs to be carefully reviewed to ensure tokens aren't leaked or improperly trusted.

## Next Steps
- Address all ESLint errors, especially replacing `any` with proper Zod schemas or TypeScript interfaces.
- Do not build further features until the Product Catalog is migrated to the database.
