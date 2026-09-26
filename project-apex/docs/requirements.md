# Project Apex - Functional & Technical Requirements

## 1. Authentication & User Management
- **Feature**: User Identity & Security
- **Purpose**: Secure access to the platform and user-specific data.
- **User Story**: As a user, I can register, log in, reset my password, and manage my profile/addresses so that I can securely purchase items and track orders.
- **Functional Requirements**: Email/password auth, email verification, session handling, protected routes, address management.
- **Non-functional Requirements**: Secure session cookies, low latency login, server-side identity verification.
- **Dependencies**: Firebase Authentication, Better-Auth, PostgreSQL (User table).
- **API Requirements**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`.
- **Database Requirements**: `User`, `Session`, `Address` tables.
- **Security Requirements**: No plain text passwords, protection against brute force, CSRF protection.

## 2. Product Catalog
- **Feature**: Core Product Database
- **Purpose**: Display available items for sale.
- **User Story**: As a customer, I want to view detailed product pages with images, variants, and stock status.
- **Functional Requirements**: Support for variants, categories, dynamic pricing, discounts, and real stock visibility. (NOTE: Kaggle dataset will be provided by user for real product images during implementation).
- **Non-functional Requirements**: High read availability, SEO-friendly SSR/SSG.
- **Dependencies**: PostgreSQL (Product schema), AWS S3 for images.
- **API Requirements**: `GET /api/products`, `GET /api/products/:id`.
- **Database Requirements**: `Product`, `ProductVariant`, `Category`, `Collection`, `ProductImage`.
- **Security Requirements**: Read-only public access.

## 3. Search & Product Discovery
- **Feature**: Catalog Navigation
- **Purpose**: Allow users to find products easily.
- **User Story**: As a customer, I want to search and filter products by category and price.
- **Functional Requirements**: Search bar, category filters, sorting (price, rating), URL-based filter state, pagination.
- **Non-functional Requirements**: Fast search response (<200ms).
- **Dependencies**: Database text search indices or external search engine.

## 4. Cart & Checkout
- **Feature**: Shopping Cart and Order Preparation
- **Purpose**: Collect items for purchase and capture delivery details.
- **User Story**: As a customer, I want to add items to my cart and proceed to a secure checkout.
- **Functional Requirements**: Persistent authenticated cart, guest cart, price recalculation, address selection, shipping calculation, idempotent checkout initiation.
- **Non-functional Requirements**: Cart state sync across tabs, robust error handling.
- **API Requirements**: `POST /api/cart`, `POST /api/checkout/initiate`.
- **Security Requirements**: Server-side price calculation (never trust client prices).

## 5. Inventory & Concurrency
- **Feature**: Stock Management
- **Purpose**: Prevent overselling limited items.
- **User Story**: As a platform, I need to ensure that 100 simultaneous users buying 5 remaining items only results in 5 successful orders.
- **Functional Requirements**: 10-minute inventory reservation during checkout, atomic decrements, transactional updates.
- **Database Requirements**: Row-level locking in PostgreSQL, `InventoryReservation` table.

## 6. Payments
- **Feature**: Payment Processing
- **Purpose**: Securely capture funds.
- **User Story**: As a customer, I want to pay for my order securely.
- **Functional Requirements**: Razorpay integration, test mode first, webhook verification, payment state synchronization.
- **Security Requirements**: Signature verification, idempotency checks, zero exposure of API secrets.

## 7. Orders & Shipping
- **Feature**: Post-Purchase Lifecycle
- **Purpose**: Fulfill and track customer purchases.
- **User Story**: As a customer, I want to track my shipped order.
- **Functional Requirements**: Order lifecycle management (PENDING to DELIVERED), immutable order snapshots, Shiprocket integration.

## 8. Reviews
- **Feature**: Customer Feedback
- **Purpose**: Build trust through verified reviews.
- **User Story**: As a verified buyer, I want to leave a review and rate products.
- **Functional Requirements**: Verified purchase checks, 1-5 rating, helpful votes, review reporting.

## 9. Notifications & Background Jobs
- **Feature**: Asynchronous Operations
- **Purpose**: Send emails and process non-blocking tasks.
- **Functional Requirements**: Transactional emails via SES/Resend, Redis for caching and queueing.
