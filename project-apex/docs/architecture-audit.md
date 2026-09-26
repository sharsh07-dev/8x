# Architecture Audit

## Overview
Project Apex is currently structured as a full-stack Next.js web application utilizing the App Router. The backend is integrated directly into the Next.js API routes (`src/app/api`), interacting with a PostgreSQL database via Prisma ORM.

## Tech Stack
- **Frontend**: Next.js 16+, React 19, Tailwind CSS v4, Zustand (state management), Lucide React (icons).
- **Backend**: Next.js API Routes (Node environment), TypeScript.
- **Database**: PostgreSQL with Prisma ORM (`@prisma/client` v6.4.1).
- **Authentication**: `better-auth` combined with Firebase / Firebase Admin SDK.
- **Payments**: Razorpay.
- **Emails**: Nodemailer.

## Architectural Patterns
- **Modular Monolith**: The application handles both client rendering and server-side logic in a unified repository.
- **Data Access**: Prisma provides typed database access. However, there's a heavy reliance on a static data file (`src/data/mockProducts.ts`) for the catalog instead of a database, which violates production architecture.
- **Authentication**: A hybrid approach using Better Auth and Firebase. The session management is handled by Better Auth, while Firebase may be used for certain OTP/external integrations.
- **API Structure**: API endpoints are organized under `src/app/api/`, mapping closely to resources (e.g., `/api/auth`, `/api/orders`, `/api/products`).

## Findings
- The application foundation is solid and modern, leveraging Next.js App Router.
- The use of mock data for the product catalog is a critical architectural flaw that needs addressing in Phase 6.
- The payment implementation (Razorpay) has scaffolding but needs rigorous testing and separation of concerns.
- Linting shows significant tech debt with `any` types across the codebase that should be resolved to ensure type safety.
