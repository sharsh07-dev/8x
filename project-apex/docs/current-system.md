# Current System State

## Directory Structure
- `src/app`: Contains the Next.js frontend pages and API routes.
- `src/components`: UI components, categorized into features (e.g., catalog, checkout, navigation, products, reviews).
- `src/data`: Contains mock data (`mockProducts.ts`, `collections.ts`, `departments.ts`).
- `src/lib`: Core utility functions, configurations, and service adapters (Auth, Firebase, Payments, Prisma).
- `prisma`: Database schema definition and migrations.

## Database Schema (`schema.prisma`)
The database contains models for:
- **Users & Auth**: `User`, `Session`, `Account`, `Verification`, `SecurityEvent`, `Address`.
- **Orders**: `Order`, `OrderItem`, `OrderAddress`.
- **Payments**: `Payment`, `IdempotencyRecord`.
- **Inventory**: `ProductInventory`.
- **Reviews**: `Review`, `ReviewHelpfulVote`, `ReviewReport`.

**Critical Gap**: The schema completely lacks models for the Product Catalog (e.g., `Product`, `ProductVariant`, `Category`, `Collection`).

## Frontend Implementation
- **Homepage (`/`)**: Shows hero banners, category cards, and trending products.
- **Product Detail Page (`/products/[id]`)**: Fully functional UI with image gallery, specs, buy box, and reviews, but it sources data from `mockProducts.ts`.
- **Auth**: Pages for login, register, verify-email, forgot-password, reset-password exist.

## Backend Implementation
- **API Routes**: Endpoints for `account`, `auth`, `checkout`, `orders`, `payments`, `products`, `reviews`, `user` are present.
- **Auth**: Implementations exist for Better Auth and Firebase session handling.
- **Payments**: Razorpay adapter and order verification endpoints are somewhat implemented.
- **Emails**: Nodemailer configuration exists for transactional emails.
