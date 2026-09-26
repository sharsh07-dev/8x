# PROJECT APEX

## Production-Grade High-Concurrency E-Commerce Platform

### Technical Requirements Document (TRD)

**Project:** Apex E-Commerce
**Platform Type:** Real-world B2C E-Commerce Platform
**Primary Market:** India
**Currency:** INR (₹)
**Initial Concurrency Target:** 100+ simultaneous active users
**Transactional Target:** 100+ concurrent checkout/payment attempts must be safely handled under load testing
**Architecture:** Decoupled Frontend + Production API + PostgreSQL + Redis + Event/Queue Infrastructure
**Payment Gateway:** Razorpay
**Logistics:** Shiprocket
**Authentication:** Existing Firebase Authentication / compatible production authentication layer
**Cloud:** Vercel + AWS
**Database:** PostgreSQL
**ORM:** Prisma
**Version Control:** GitHub

---

# 1. DOCUMENT PURPOSE

This Technical Requirements Document defines the production architecture, technology stack, infrastructure, security, database, API, performance, scalability, payment, logistics, authentication, testing, deployment, and code-quality requirements for Project Apex.

Apex must evolve from its existing e-commerce implementation into a **real commercial platform**.

This is NOT a mockup, prototype-only system, or static frontend.

The final platform must support:

* Real users
* Real authentication
* Real database persistence
* Real products
* Real inventory
* Real carts
* Real checkout
* Real Razorpay payments
* Real orders
* Real order tracking
* Real customer reviews
* Real returns/refunds
* Real transactional notifications
* Real API communication
* Production monitoring
* Secure deployment
* Horizontal scaling

The existing Apex project must be treated as the starting point.

**Do not unnecessarily rebuild the entire application from zero.**

---

# 2. EXISTING APEX SYSTEM

The existing Apex application already contains significant functionality.

The implementation must first inspect and preserve existing working functionality including:

* Next.js application
* React frontend
* TypeScript
* Tailwind CSS
* Prisma ORM
* PostgreSQL/Supabase
* Firebase Authentication
* Product catalog
* Search
* Categories
* Product detail pages
* Cart
* Reviews
* Customer account
* Orders
* Checkout
* Razorpay integration
* Legal/support pages
* Existing tests
* Existing deployment configuration

The engineering team/IDE agent must determine what is already production-ready before replacing anything.

### Mandatory rule

> **Reuse correct existing functionality. Improve weak functionality. Replace only when technically justified.**

Do not create duplicate:

* Backend systems
* Databases
* Authentication systems
* Product APIs
* Cart systems
* Order systems
* Payment systems

unless the architecture audit proves the existing implementation is unsuitable.

---

# 3. ARCHITECTURAL OBJECTIVE

Apex will use a **decoupled frontend and backend architecture** so that the customer-facing storefront can scale independently from business-critical transactional services.

Target architecture:

```text
                         INTERNET
                            |
                            v
                       Route 53 / DNS
                            |
                            v
                       CloudFront CDN
                            |
                         AWS WAF
                            |
             +--------------+--------------+
             |                             |
             v                             v
        Vercel Edge                   AWS Backend
        Frontend                         Layer
             |                             |
             |                    Application Load Balancer
             |                             |
             |                    +--------+--------+
             |                    |                 |
             |                    v                 v
             |               API Instance 1   API Instance 2
             |                    |                 |
             |                    +--------+--------+
             |                             |
             |                  +----------+----------+
             |                  |                     |
             |                  v                     v
             |               Redis                PostgreSQL
             |             ElastiCache              RDS
             |                  |                     |
             |                  |              +------+------+
             |                  |              |             |
             |                  |              v             v
             |                  |           Orders       Inventory
             |                  |
             |                  v
             |                 SQS
             |                  |
             |                  v
             |            Background Workers
             |
             +------------------------------+
                                            |
                              +-------------+-------------+
                              |             |             |
                              v             v             v
                           Firebase       Razorpay      Shiprocket
                           Auth           Payments       Logistics
```

The architecture must remain simple enough to maintain while allowing horizontal scaling.

---

# 4. TECHNOLOGY STACK

## 4.1 Frontend

Use:

* Next.js 16+
* React 19+
* TypeScript
* App Router
* Tailwind CSS
* Zustand
* GSAP only where animation complexity justifies it
* Lucide Icons or the existing icon library
* Server Components wherever appropriate
* Client Components only where interactivity requires them

### Frontend principles

* Server-render static/catalog content wherever possible.
* Avoid unnecessary client-side JavaScript.
* Use dynamic rendering only where required.
* Lazy-load heavy components.
* Optimize images.
* Use responsive layouts.
* Avoid unnecessary dependencies.

---

# 5. BACKEND ARCHITECTURE

## 5.1 Backend

Use:

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL
* Redis
* REST APIs
* AWS SQS for asynchronous processing

The backend must be containerized with Docker.

### Backend modules

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── categories/
│   ├── search/
│   ├── cart/
│   ├── checkout/
│   ├── inventory/
│   ├── orders/
│   ├── payments/
│   ├── shipping/
│   ├── reviews/
│   ├── returns/
│   ├── notifications/
│   └── admin/
│
├── middleware/
├── routes/
├── services/
├── repositories/
├── validators/
├── utils/
├── config/
└── server.ts
```

Do not place all business logic inside route handlers.

---

# 6. CLEAN CODE REQUIREMENT

This is a **mandatory requirement**.

The implementation must contain clean, maintainable, production-quality code.

Do NOT generate:

* Giant components
* Giant API files
* 500+ line route handlers
* Duplicate functions
* Duplicate API calls
* Repeated validation logic
* Hardcoded business rules
* Magic numbers
* Magic strings
* Unused imports
* Dead code
* Commented-out old implementations
* Temporary debugging code
* `console.log()` statements containing sensitive data
* `any` unless technically unavoidable and documented
* Fake API responses
* Mock data in production paths
* Copy-pasted business logic
* Unnecessary abstractions
* Over-engineered patterns
* Circular dependencies

### Required principles

Follow:

* SOLID
* DRY
* KISS
* Separation of concerns
* Single responsibility
* Dependency inversion where useful
* Repository/service separation where appropriate
* Strong typing
* Reusable validation
* Centralized error handling

---

# 7. CODE ORGANIZATION

Use clear separation:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL
```

Example:

```text
POST /orders
     ↓
OrderController
     ↓
OrderService
     ↓
OrderRepository
     ↓
Prisma
     ↓
PostgreSQL
```

Controllers should not contain complex business logic.

Repositories should not contain HTTP logic.

Frontend components should not directly contain database logic.

---

# 8. DATABASE

Use PostgreSQL as the authoritative source of truth.

Recommended production deployment:

**AWS RDS PostgreSQL**

The existing Supabase PostgreSQL database may continue during development/staging or until migration is justified.

Do NOT migrate unnecessarily.

---

# 9. DATABASE MODELS

The system must support, as applicable:

```text
User
Address
Product
ProductVariant
ProductImage
Category
Subcategory
Collection
Inventory
InventoryReservation
Cart
CartItem
Order
OrderItem
Payment
PaymentEvent
Shipment
TrackingEvent
Review
ReviewHelpfulVote
ReviewReport
Coupon
CouponUsage
Return
Refund
Notification
SecurityEvent
IdempotencyRecord
```

Adapt the existing Prisma schema instead of blindly recreating models.

---

# 10. DATABASE INTEGRITY

Every production-critical table must have:

* Primary key
* Foreign keys
* Unique constraints
* Appropriate indexes
* Created timestamp
* Updated timestamp
* Referential integrity
* Safe deletion rules

Use transactions for:

* Order creation
* Inventory reservation
* Payment state updates
* Refunds
* Cancellation
* Critical inventory changes

---

# 11. INVENTORY CONCURRENCY

Inventory is a critical business requirement.

The system must prevent overselling.

Example:

```text
Stock = 10

Customer A → requests 7
Customer B → requests 5
```

The database must allow only valid allocations.

Use PostgreSQL transactions and appropriate row-level locking/atomic conditional updates.

Where Prisma supports the required operation, use transactional queries and appropriate locking strategy.

Do not rely on:

```text
Frontend stock === true
```

as inventory protection.

---

# 12. INVENTORY RESERVATION

During checkout:

```text
Cart
 ↓
Checkout
 ↓
Validate Stock
 ↓
Reserve Inventory
 ↓
Create Payment
 ↓
Payment
 ↓
Verify Payment
 ↓
Confirm Order
 ↓
Commit Inventory
```

Reservation expiration:

```text
Default reservation window: 10 minutes
```

The exact duration must be configurable.

If payment fails or the reservation expires:

```text
Reservation
     ↓
Released
     ↓
Inventory Available Again
```

---

# 13. PRODUCT CATALOG

Products must be database-backed.

Each product must support:

* ID
* SKU
* Name
* Slug
* Description
* Brand
* Category
* Subcategory
* Images
* Price
* Compare-at price
* Discount
* Tax information
* Availability
* Variants
* Attributes
* Rating
* Review count
* Created date
* Updated date

Never hardcode product inventory or prices in the production frontend.

---

# 14. CATALOG PERFORMANCE

Product pages should use Next.js rendering strategies appropriately:

* SSR where personalization or freshness requires it
* SSG/ISR for relatively stable catalog content
* Dynamic rendering for inventory-sensitive information

Do NOT blindly statically generate inventory-sensitive information.

Inventory and price must be validated against the backend before checkout.

Use cache invalidation/revalidation when:

* Product price changes
* Product availability changes
* Product information changes

---

# 15. REDIS

Use AWS ElastiCache for Redis/Valkey.

Use Redis for:

* Catalog caching
* Category caching
* Rate limiting
* Temporary state
* Distributed locks where justified
* Idempotency support where appropriate
* Frequently accessed configuration

PostgreSQL remains the source of truth.

Never store permanent order/payment truth exclusively in Redis.

---

# 16. CART

Apex cart must support:

* Add product
* Remove product
* Quantity updates
* Stock validation
* Price refresh
* Persistent cart
* Guest cart
* Authenticated cart
* Guest-to-user cart merge

Zustand may be used for responsive client-side state.

However:

> **Zustand is not the authoritative cart database.**

Authenticated cart persistence must be backed by the backend/database.

Redis may be used as an acceleration layer.

---

# 17. AUTHENTICATION

Use the existing Firebase Authentication implementation if it passes the production audit.

Required:

* Registration
* Login
* Logout
* Email verification
* Forgot password
* Reset password
* Session management
* Token verification
* Secure cookies
* Authorization

Optional OAuth providers:

* Google
* Apple

Only implement providers that can be fully configured and tested.

---

# 18. FORGOT PASSWORD

The forgot-password system must actually work.

Flow:

```text
Forgot Password
      ↓
Enter Email
      ↓
Secure Reset Request
      ↓
Email
      ↓
Reset Link
      ↓
New Password
      ↓
Session Revocation
```

Do not reveal whether an email address is registered.

Apply rate limiting.

---

# 19. PRODUCT SEARCH

Search must query real product data.

Support:

* Keyword
* Category
* Subcategory
* Brand
* Price
* Rating
* Availability
* Discount
* Sorting

Initial implementation may use PostgreSQL indexes/search.

Only introduce OpenSearch later if actual catalog size and search requirements justify it.

---

# 20. CHECKOUT

Checkout must be transactional.

Required sequence:

```text
Cart
 ↓
Address
 ↓
Shipping
 ↓
Server Pricing
 ↓
Coupon Validation
 ↓
Inventory Validation
 ↓
Inventory Reservation
 ↓
Payment Creation
 ↓
Payment
 ↓
Payment Verification
 ↓
Order Creation
 ↓
Inventory Commit
 ↓
Notification
```

The server must calculate:

* Product prices
* Quantity
* Discount
* Tax
* Shipping
* Final total

The client must never determine the final payable amount.

---

# 21. PAYMENT — RAZORPAY

Use Razorpay for Indian payments.

Support:

* UPI
* Cards
* Netbanking
* Supported Razorpay methods

### Payment flow

```text
Customer
 ↓
Apex Checkout
 ↓
Apex API
 ↓
Razorpay Order
 ↓
Razorpay Checkout
 ↓
Payment
 ↓
Razorpay Response
 ↓
Apex API
 ↓
Signature Verification
 ↓
Payment Record
 ↓
Order Confirmation
```

Never trust a client-side:

```text
paymentSuccess = true
```

---

# 22. RAZORPAY WEBHOOKS

Implement verified Razorpay webhooks.

At minimum handle relevant:

```text
payment.captured
payment.failed
```

Webhook requirements:

* Signature verification
* Idempotent processing
* Event persistence
* Duplicate-event protection
* Retry-safe processing
* Logging without secrets

Never process an unverified webhook.

---

# 23. PAYMENT STATES

Use controlled payment states:

```text
CREATED
AUTHORIZED
CAPTURED
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

Only server-side business logic can transition payment state.

---

# 24. IDEMPOTENCY

Mandatory for:

* Order creation
* Payment creation
* Payment verification
* Refund
* Cancellation
* Razorpay webhooks
* Shiprocket webhooks

Example:

```text
Request
 ↓
Idempotency Key
 ↓
Already processed?
 ├── YES → Return previous result
 └── NO → Process
```

Double-clicking Pay must never produce duplicate orders.

---

# 25. ORDER MANAGEMENT

Order states:

```text
PENDING_PAYMENT
PAID
CONFIRMED
PROCESSING
PACKED
SHIPPED
OUT_FOR_DELIVERY
DELIVERED
```

Alternative states:

```text
PAYMENT_FAILED
CANCELLED
RETURN_REQUESTED
RETURNED
REFUNDED
```

Customers cannot arbitrarily change order state.

Every important state transition must be persisted.

---

# 26. ORDER SNAPSHOTS

Orders must store historical snapshots of:

* Product name
* SKU
* Price
* Quantity
* Tax
* Discount
* Shipping address
* Billing address where applicable

Historical orders must not change because the product record changes later.

---

# 27. SHIPPING & LOGISTICS — SHIPROCKET

Integrate Shiprocket for logistics.

After a verified order:

```text
Payment Verified
      ↓
Order Confirmed
      ↓
Shiprocket API
      ↓
Shipment Created
      ↓
AWB Generated
      ↓
Shipment Tracking
```

Store:

* Shiprocket order ID
* Shipment ID
* AWB
* Courier
* Tracking status
* Estimated delivery
* Tracking events

Do not expose Shiprocket credentials to the frontend.

---

# 28. REAL ORDER TRACKING

Create:

```text
/order/[orderId]/tracking
```

or equivalent route.

Display:

```text
Order Confirmed
      ↓
Packed
      ↓
Manifested
      ↓
Picked Up
      ↓
In Transit
      ↓
Out for Delivery
      ↓
Delivered
```

Use Shiprocket webhook/event data where available.

Do NOT describe polling as a substitute for webhook ingestion.

Preferred architecture:

```text
Shiprocket
    ↓
Webhook
    ↓
Apex API
    ↓
Verify Event
    ↓
PostgreSQL
    ↓
Real-Time Update
    ↓
Customer UI
```

Polling may be used as a fallback/reconciliation mechanism.

---

# 29. REAL-TIME STATE MANAGEMENT

Use real-time updates for:

* Order tracking
* Payment state
* Important notifications
* Inventory state where beneficial

Possible technologies:

* Server-Sent Events
* WebSockets
* Supabase Realtime where retained
* Another managed real-time service

Do not introduce real-time infrastructure where ordinary request/response is sufficient.

---

# 30. TRANSACTIONAL EMAIL

Use:

* Amazon SES
* Resend

Choose one production provider.

Emails:

* Registration
* Email verification
* Password reset
* Order confirmation
* Payment confirmation
* Payment failure
* Shipment confirmation
* Out-for-delivery
* Delivery confirmation
* Cancellation
* Refund

All email sending should be asynchronous where practical.

---

# 31. FRONTEND

The frontend must be redesigned into an original Apex experience.

Do not simply copy Amazon or Flipkart.

Create:

* Apex design system
* Typography
* Color system
* Navigation
* Product cards
* Product detail layout
* Checkout
* Account dashboard
* Order tracking
* Mobile UI
* Animations
* Loading states
* Error states
* Empty states

The backend and data architecture must remain real.

---

# 32. ADMINISTRATION

Provide protected admin capabilities.

### Products

* Create
* Edit
* Disable
* Images
* Variants
* Pricing
* Inventory

### Orders

* Search
* View
* Update fulfillment
* Cancellation
* Returns
* Refunds
* Shipment

### Customers

* Search
* View
* Orders
* Account status

### Reviews

* Moderate
* Hide
* Restore
* Reports

### Analytics

* Orders
* Revenue
* Customers
* Products
* Inventory

Use server-side RBAC.

---

# 33. INFRASTRUCTURE

## Frontend

Deploy the Next.js frontend on:

**Vercel**

Use:

* CDN
* Edge delivery
* Preview deployments
* Production deployments
* Environment variables
* Performance monitoring

## Backend

Deploy the Express API using:

**AWS ECS + AWS Fargate**

Requirements:

* Docker
* Application Load Balancer
* Health checks
* Auto scaling
* Multiple tasks
* Private networking where applicable

Initial target:

```text
Minimum tasks: 2
Maximum tasks: configurable based on load
```

Do not claim scalability without load-testing it.

---

# 34. DATABASE INFRASTRUCTURE

Use:

**AWS RDS PostgreSQL**

Production requirements:

* Multi-AZ where justified
* Automated backups
* Point-in-time recovery
* Encryption at rest
* Private networking
* Connection pooling
* Monitoring
* Migration management

The database must not be publicly exposed.

---

# 35. CACHE INFRASTRUCTURE

Use:

**AWS ElastiCache Redis/Valkey**

Use for:

* Cache
* Rate limiting
* Temporary state
* Distributed coordination where necessary

Configure appropriate expiration policies.

---

# 36. OBJECT STORAGE

Use:

**Amazon S3**

For:

* Product images
* Product assets
* Invoices
* Customer-uploaded assets where required

Serve public product assets through CloudFront.

Do not store binary product media directly inside PostgreSQL.

---

# 37. QUEUE

Use:

**Amazon SQS**

Use queues for:

* Emails
* Notifications
* Invoice generation
* Shipment processing
* Webhook processing where appropriate
* Background jobs

Workers must be retry-safe.

---

# 38. SECURITY

Mandatory:

* HTTPS
* TLS
* Secure cookies
* Authentication
* Authorization
* RBAC
* Rate limiting
* Input validation
* Output validation
* XSS protection
* CSRF protection where applicable
* Secure file uploads
* Payment signature verification
* Webhook verification
* Secret management
* Audit logging

Do not hardcode credentials.

---

# 39. PASSWORD SECURITY

If Firebase/Supabase Auth manages passwords, do not implement an unnecessary second password-hashing system.

Do not manually store plaintext passwords.

Do not store Firebase Admin secrets in the frontend.

Authentication-provider password storage must remain the authoritative credential system.

---

# 40. RATE LIMITING

Use Redis-backed rate limiting for:

```text
/login
/register
/forgot-password
/reset-password
/payment
/orders
/reviews
/coupons
/webhooks
```

Different endpoints may have different limits.

Never rely solely on frontend throttling.

---

# 41. PERFORMANCE REQUIREMENTS

Initial engineering targets:

| Metric                       |                                       Target |
| ---------------------------- | -------------------------------------------: |
| Cached page TTFB             |                              < 100 ms target |
| Standard API                 |                              < 200 ms target |
| Transactional API            |                              < 500 ms target |
| Checkout internal processing | < 1 second target excluding payment provider |
| Interactive page experience  |                             < 1.5 sec target |
| Concurrent active users      |                                         100+ |
| Overselling                  |                                            0 |
| Duplicate payment orders     |                                            0 |

These are **targets**, not guarantees.

Actual results must be established through performance testing.

---

# 42. CONCURRENCY REQUIREMENT

The system must be load-tested with:

```text
25 users
50 users
100 users
150 users
200 users
```

Test:

* Browsing
* Product views
* Search
* Cart
* Checkout
* Payment initiation
* Concurrent inventory purchases

The system must remain consistent under concurrency.

---

# 43. CRITICAL INVENTORY TEST

Example:

```text
Product stock = 10

100 customers attempt to buy 1 item simultaneously.
```

Expected:

```text
Successful allocation <= 10
Overselling = 0
Negative inventory = 0
Duplicate orders = 0
```

This test must pass before production launch.

---

# 44. OBSERVABILITY

Use:

* AWS CloudWatch
* Sentry or equivalent

Monitor:

* API latency
* Error rates
* 5xx
* Database connections
* Database latency
* Redis performance
* Queue backlog
* Payment failures
* Checkout failures
* Inventory conflicts
* Authentication failures
* CPU
* Memory

Create alerts for critical production failures.

---

# 45. LOGGING

Use structured logs.

Every request should have:

```text
requestId
timestamp
route
method
status
duration
userId where appropriate
```

Never log:

* Passwords
* Firebase private keys
* Razorpay secrets
* Authorization tokens
* Full payment credentials
* Sensitive customer information unnecessarily

---

# 46. ERROR HANDLING

Implement centralized error handling.

Never return:

```text
Internal Server Error: PrismaClientKnownRequestError...
```

to customers.

Return safe application errors:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "The requested quantity is currently unavailable."
  },
  "requestId": "..."
}
```

---

# 47. API DESIGN

Use REST APIs with consistent conventions.

Example:

```text
GET    /api/products
GET    /api/products/:id
GET    /api/categories
GET    /api/search
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:id
DELETE /api/cart/items/:id

POST   /api/checkout
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id

POST   /api/payments/razorpay/order
POST   /api/payments/razorpay/verify
POST   /api/payments/razorpay/webhook

GET    /api/orders/:id/tracking

GET    /api/products/:id/reviews
POST   /api/products/:id/reviews
```

Use request validation for every endpoint.

---

# 48. API DOCUMENTATION

Document:

* HTTP method
* Endpoint
* Authentication
* Authorization
* Request
* Response
* Error codes
* Rate limit
* Idempotency requirements

Use OpenAPI/Swagger where appropriate.

---

# 49. CI/CD

Use:

**GitHub Actions**

Pipeline:

```text
Git Push
    ↓
Install
    ↓
Lint
    ↓
Typecheck
    ↓
Unit Tests
    ↓
Integration Tests
    ↓
Security Checks
    ↓
Build
    ↓
Docker Build
    ↓
Push to AWS ECR
    ↓
Deploy Backend to ECS
```

Frontend:

```text
Git Push
    ↓
GitHub
    ↓
Vercel
    ↓
Build
    ↓
Deploy
```

Production deployment must not occur when mandatory checks fail.

---

# 50. ENVIRONMENTS

Maintain completely separate:

```text
Development
Staging
Production
```

Each environment must have appropriate:

* Database
* Firebase project/configuration
* Razorpay credentials
* Shiprocket credentials
* Redis
* S3
* Email provider
* Secrets

Never connect local development to the production database.

---

# 51. SECRETS MANAGEMENT

Production secrets must use:

**AWS Secrets Manager**

Examples:

```text
DATABASE_URL
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
SHIPROCKET_API_SECRET
FIREBASE_PRIVATE_KEY
AWS credentials
EMAIL credentials
REDIS credentials
```

Never commit secrets to GitHub.

---

# 52. BACKUPS & DISASTER RECOVERY

Configure:

* Automated PostgreSQL backups
* Point-in-time recovery
* Backup retention
* Recovery documentation
* Restore testing

A backup is not considered reliable until restoration has been tested.

---

# 53. TESTING REQUIREMENTS

### Unit Testing

Test:

* Pricing
* Discounts
* Tax
* Inventory
* Coupons
* Order states
* Payment states

### Integration Testing

Test:

* PostgreSQL
* Firebase
* Razorpay
* Shiprocket
* Redis
* SQS

### E2E Testing

Test:

```text
Register
 ↓
Verify Email
 ↓
Login
 ↓
Browse
 ↓
Search
 ↓
Product
 ↓
Cart
 ↓
Checkout
 ↓
Payment
 ↓
Order
 ↓
Tracking
 ↓
Review
```

---

# 54. SECURITY TESTING

Test:

* Unauthorized API access
* Broken object-level authorization
* SQL injection
* XSS
* CSRF
* Rate-limit bypass
* Invalid JWT
* Expired JWT
* Webhook forgery
* Payment signature forgery
* Duplicate payment
* Duplicate order
* Inventory race conditions
* Privilege escalation
* Admin access

---

# 55. LOAD TESTING

Use:

**k6**

Scenarios:

### Scenario A

100 concurrent visitors browsing.

### Scenario B

100 concurrent product requests.

### Scenario C

100 concurrent searches.

### Scenario D

100 concurrent cart operations.

### Scenario E

100 concurrent checkout requests.

### Scenario F

100 concurrent users attempting to purchase limited stock.

Record:

* p50 latency
* p95 latency
* p99 latency
* error rate
* throughput
* CPU
* memory
* database connections
* Redis usage
* queue backlog

---

# 56. CODE QUALITY — MANDATORY

The generated code must be **clean, professional, readable, and maintainable**.

Before completing any implementation:

### Remove

* Dead code
* Unused files
* Unused imports
* Debugging statements
* Temporary hacks
* Duplicate components
* Duplicate APIs
* Commented-out old implementations

### Avoid

```text
any
as any
@ts-ignore
@ts-nocheck
eslint-disable
```

unless absolutely necessary.

If an exception is required, document why.

### Components

Do not create giant components.

Prefer:

```text
ProductPage
 ├── ProductGallery
 ├── ProductInformation
 ├── ProductPricing
 ├── ProductAvailability
 ├── QuantitySelector
 ├── AddToCart
 └── Reviews
```

instead of one enormous file.

### Backend

Prefer:

```text
Controller
 ↓
Service
 ↓
Repository
 ↓
Prisma
```

### Validation

Centralize validation schemas.

Do not duplicate the same validation rules across 10 endpoints.

---

# 57. NO QUICK FIXES

Never solve an error using a temporary hack merely to make the build pass.

Do NOT:

```text
disable TypeScript
disable ESLint
ignore an exception
hardcode a value
return fake data
skip validation
remove a failing test
comment out broken functionality
```

Instead:

1. Understand the root cause.
2. Fix the underlying problem.
3. Test the fix.
4. Refactor if necessary.
5. Document architectural decisions where appropriate.

---

# 58. DATABASE CODE QUALITY

Prisma queries must:

* Select only required fields where appropriate
* Use indexes
* Avoid N+1 queries
* Use transactions for critical workflows
* Avoid unnecessary database calls
* Avoid loading entire tables
* Use pagination
* Use proper filtering

For list endpoints:

```text
NEVER:
SELECT everything
load entire database
filter in JavaScript
```

Use database-side filtering and pagination.

---

# 59. API CODE QUALITY

Every API endpoint must have:

```text
Authentication
Authorization
Validation
Business Logic
Error Handling
Logging
```

Do not mix all responsibilities inside a single function.

---

# 60. FRONTEND CODE QUALITY

Frontend must avoid:

* Excessive `useEffect`
* Duplicate API fetching
* Unnecessary client components
* Massive page components
* Prop drilling where avoidable
* Duplicate UI logic
* Hardcoded API URLs
* Hardcoded business data

Use reusable components and typed API clients.

---

# 61. DOCUMENTATION REQUIREMENTS

Create:

```text
docs/
├── ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── AUTHENTICATION.md
├── PAYMENTS.md
├── ORDERS.md
├── INVENTORY.md
├── SHIPPING.md
├── SECURITY.md
├── DEPLOYMENT.md
├── LOAD-TESTING.md
└── RUNBOOK.md
```

Documentation must describe the actual implementation, not an imagined future architecture.

---

# 62. IMPLEMENTATION PHASES

Implementation must follow these milestones:

```text
PHASE 0  → Existing Architecture Audit
PHASE 1  → Production Foundation
PHASE 2  → Database Hardening
PHASE 3  → Authentication
PHASE 4  → Catalog & Search
PHASE 5  → Apex Frontend Redesign
PHASE 6  → Cart
PHASE 7  → Inventory & Concurrency
PHASE 8  → Checkout
PHASE 9  → Razorpay
PHASE 10 → Orders
PHASE 11 → Shiprocket Tracking
PHASE 12 → Reviews
PHASE 13 → Notifications
PHASE 14 → Admin
PHASE 15 → Security Hardening
PHASE 16 → AWS Infrastructure
PHASE 17 → CI/CD
PHASE 18 → QA
PHASE 19 → Load Testing
PHASE 20 → Staging
PHASE 21 → Production Readiness
PHASE 22 → Production Launch
```

Never skip directly from UI development to production deployment.

---

# 63. PHASE COMPLETION RULE

A phase is NOT complete because the feature visually exists.

Each phase must satisfy:

```text
Implementation
      +
Unit Tests
      +
Integration Tests where applicable
      +
Browser Verification
      +
Database Verification
      +
Security Verification where applicable
      +
Documentation
```

Only then can it be marked complete.

---

# 64. DEVELOPMENT WORKFLOW

For every major implementation:

1. Inspect existing code.
2. Identify reusable code.
3. Plan the change.
4. Implement the smallest clean solution.
5. Run TypeScript checks.
6. Run lint.
7. Run relevant tests.
8. Start/keep the development server running.
9. Inspect the actual browser UI.
10. Test network/API requests.
11. Verify database state.
12. Fix all errors.
13. Refactor poor code.
14. Commit the completed change.

Never assume functionality works merely because compilation succeeds.

---

# 65. GIT REQUIREMENTS

Use meaningful commits.

Examples:

```text
feat(auth): implement production password recovery
feat(inventory): add transactional stock reservation
feat(payment): implement razorpay webhook verification
feat(shipping): integrate shiprocket tracking
refactor(api): separate order service from controller
fix(checkout): prevent duplicate order creation
test(inventory): add concurrent purchase tests
chore(ci): add production deployment pipeline
```

Do not make commits such as:

```text
fix
update
changes
final
final2
new
test
```

---

# 66. PRODUCTION READINESS GATE

Apex must NOT be declared production-ready until all of the following are verified:

### Frontend

* [ ] Original Apex design
* [ ] Responsive
* [ ] Accessible
* [ ] SEO-ready
* [ ] Loading states
* [ ] Error states
* [ ] Empty states

### Authentication

* [ ] Registration
* [ ] Login
* [ ] Logout
* [ ] Email verification
* [ ] Forgot password
* [ ] Reset password
* [ ] Session security
* [ ] Authorization

### Catalog

* [ ] Real products
* [ ] Real database
* [ ] Search
* [ ] Filters
* [ ] Categories
* [ ] Product variants
* [ ] Inventory

### Cart

* [ ] Persistent
* [ ] Server validation
* [ ] Stock validation
* [ ] Price validation
* [ ] Guest/user merge

### Checkout

* [ ] Real pricing
* [ ] Tax
* [ ] Shipping
* [ ] Coupons
* [ ] Inventory reservation
* [ ] Idempotency

### Payments

* [ ] Razorpay
* [ ] Signature verification
* [ ] Webhooks
* [ ] Failure handling
* [ ] Refunds
* [ ] Duplicate protection

### Orders

* [ ] Real persistence
* [ ] State machine
* [ ] Cancellation
* [ ] Returns
* [ ] Refunds

### Shipping

* [ ] Shiprocket
* [ ] AWB
* [ ] Tracking
* [ ] Webhooks
* [ ] Customer tracking

### Infrastructure

* [ ] Vercel
* [ ] AWS ECS
* [ ] RDS PostgreSQL
* [ ] Redis
* [ ] S3
* [ ] SQS
* [ ] WAF
* [ ] CloudFront
* [ ] Secrets Manager
* [ ] Monitoring
* [ ] Backups

### Quality

* [ ] TypeScript passes
* [ ] Lint passes
* [ ] Unit tests pass
* [ ] Integration tests pass
* [ ] E2E tests pass
* [ ] Security tests pass
* [ ] Load tests pass
* [ ] Concurrency tests pass

---

# 67. FIRST ACTION — MANDATORY

Before writing or modifying production code:

### Step 1

Inspect the entire existing Apex repository.

### Step 2

Generate:

```text
CURRENT_ARCHITECTURE.md
CURRENT_DATABASE.md
CURRENT_APIS.md
CURRENT_AUTH.md
CURRENT_PAYMENT_FLOW.md
CURRENT_ORDER_FLOW.md
CURRENT_DEPLOYMENT.md
```

### Step 3

Create a production gap analysis:

```text
CURRENT IMPLEMENTATION
        ↓
REQUIRED IMPLEMENTATION
        ↓
GAP
        ↓
PROPOSED SOLUTION
        ↓
FILES/MODULES AFFECTED
        ↓
TEST REQUIRED
```

### Step 4

Identify:

* What can be reused
* What must be refactored
* What must be replaced
* What is missing
* What is insecure
* What is duplicated
* What is hardcoded
* What is mocked
* What is not production-safe

### Step 5

Only after this audit should implementation begin.

---

# 68. FINAL ENGINEERING PRINCIPLE

The objective is not to make Apex look technically complicated.

The objective is to make Apex **correct, reliable, secure, maintainable, fast, and scalable**.

Prioritize:

```text
1. Data correctness
2. Payment correctness
3. Inventory correctness
4. Security
5. Reliability
6. Clean code
7. Performance
8. Scalability
9. Maintainability
10. User experience
```

Never sacrifice financial/data correctness merely to improve apparent speed.

Never sacrifice code quality merely to finish a feature faster.

Never use mock data in production paths.

Never use hardcoded business logic where it should come from the database or configuration.

Never mark a feature complete without testing it.

---

# 69. FINAL SUCCESS CRITERIA

A real customer must be able to:

```text
Visit Apex
    ↓
Browse real products
    ↓
Search/filter products
    ↓
Open product
    ↓
View real availability
    ↓
Add to cart
    ↓
Register/Login
    ↓
Verify email
    ↓
Add address
    ↓
Checkout
    ↓
Reserve inventory
    ↓
Pay through Razorpay
    ↓
Server verifies payment
    ↓
Order is created
    ↓
Inventory is committed
    ↓
Shiprocket shipment created
    ↓
AWB generated
    ↓
Order tracking begins
    ↓
Customer receives notifications
    ↓
Order delivered
    ↓
Customer submits verified review
```

Every critical step must use real backend services and persistent data.

The final implementation must be clean enough that another professional engineer can enter the repository, understand the architecture, run the project locally, run the test suite, understand the database, trace an order from checkout to delivery, and safely extend the system without rewriting the application.
