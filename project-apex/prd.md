# PROJECT APEX

## Production-Grade E-Commerce Platform — Master PRD & Implementation Prompt

### ROLE

You are a senior staff-level full-stack engineer, software architect, DevOps engineer, database engineer, security engineer, and e-commerce systems engineer.

You are working on **Project Apex**, an existing full-stack e-commerce application.

The objective is NOT to create a disposable demo, mockup, or hackathon prototype.

The objective is to evolve the existing Apex application into a **real-world, production-ready e-commerce platform** that can be used for an actual online business.

The application must support real customers, real authentication, real products, real inventory, real orders, real payments, real order tracking, real database persistence, and real transactional workflows.

---

# 1. CRITICAL INSTRUCTION — PRESERVE THE EXISTING SYSTEM

Before making ANY changes:

1. Inspect the complete existing repository.
2. Understand the current architecture.
3. Identify the existing frontend, backend/API layer, Prisma schema, PostgreSQL/Supabase configuration, Firebase authentication, Razorpay integration, product system, cart system, order system, review system, and account system.
4. Identify which existing functionality is already production-capable.
5. Reuse existing functionality wherever it is correct.
6. Do NOT unnecessarily rewrite working backend logic.
7. Do NOT create a second independent backend.
8. Do NOT create a second database unless there is a documented architectural reason.
9. Do NOT replace working APIs merely for stylistic reasons.
10. Do NOT break existing routes or business logic without a migration plan.

The existing Apex backend is the foundation.

The primary redesign requirement is to create a significantly improved, proprietary frontend experience while strengthening the backend and infrastructure wherever production requirements are not currently satisfied.

---

# 2. PRODUCT OBJECTIVE

Transform Apex from an existing e-commerce application into a production-grade commercial platform.

The platform must support:

* Real customer registration
* Real login
* Real email verification
* Real forgot-password flow
* Real session management
* Real product data
* Real PostgreSQL persistence
* Real product search
* Real cart persistence
* Real inventory
* Real checkout
* Real Razorpay payments
* Real order creation
* Real order history
* Real order tracking
* Real cancellation
* Real return/refund workflows
* Real customer reviews
* Real addresses
* Real transactional notifications
* Real admin/operations capability
* Production monitoring
* Error handling
* Security
* Backup and recovery
* Horizontal scalability

The platform should initially support **100+ simultaneous active users**, including concurrent shopping and checkout activity, with sufficient architectural headroom for growth.

Do NOT simply claim that the system supports 100 users.

The implementation must be designed and load-tested to validate the requirement.

---

# 3. CORE PRINCIPLE

The frontend may be completely redesigned.

The backend must remain real.

Every important frontend operation must eventually communicate with a real backend/data source.

NEVER use mock production data.

NEVER hardcode:

* Product inventory
* Product prices
* Customer accounts
* Order status
* Payment success
* Shipping status
* Review counts
* Stock quantities

unless the value is genuinely static configuration.

---

# 4. TARGET ARCHITECTURE

Use a **modular monolith architecture initially**, not unnecessary microservices.

The architecture should be:

```text
Customer
   |
   v
Apex Frontend
   |
   v
Next.js Application
   |
   +----------------------+
   |                      |
   v                      v
API / Server Layer     Authentication
   |                      |
   v                      v
Prisma                 Firebase
   |
   v
PostgreSQL
   |
   +-------------------+
   |                   |
   v                   v
Orders              Inventory
   |
   +-------------------+
                       |
                       v
                 Payment System
                       |
                       v
                    Razorpay
```

For production infrastructure, prepare the system to scale horizontally.

Preferred production architecture:

```text
Internet
   |
Route 53
   |
CloudFront
   |
AWS WAF
   |
Application Load Balancer
   |
+-----------------------------+
|                             |
v                             v
Apex App Instance 1      Apex App Instance 2
|                             |
+-------------+---------------+
              |
       +------+------+
       |             |
       v             v
 PostgreSQL        Redis
       |             |
       v             v
   Persistent      Cache/
     Data        Rate Limiting
       |
       v
      SQS
       |
       v
 Background Workers
```

Do not implement unnecessary infrastructure if it provides no immediate benefit, but architect the application so it can scale into this structure.

---

# 5. TECHNOLOGY STACK

## Frontend

Use:

* Next.js 16+
* React 19+
* TypeScript
* App Router
* Tailwind CSS
* Lucide Icons or existing icon system
* Server Components where appropriate
* Client Components only where interactivity requires them

Use modern React/Next.js patterns.

Avoid unnecessary client-side rendering.

---

# 6. BACKEND

Keep the existing Next.js backend/API architecture if it is suitable.

Use:

* Next.js Route Handlers
* Server-side business logic
* Prisma ORM
* PostgreSQL
* Firebase Admin
* Razorpay server SDK/API
* Background workers where required

Organize business logic into modules:

```text
auth
users
products
categories
search
cart
checkout
orders
payments
inventory
reviews
addresses
shipping
returns
notifications
admin
```

Do not put all business logic directly inside UI components.

---

# 7. DATABASE

PostgreSQL must be the authoritative source of truth for business data.

Use the existing PostgreSQL/Supabase database if it is correctly configured.

Do NOT migrate databases unnecessarily.

The schema must support at minimum:

```text
User
Address
Product
ProductVariant
Category
ProductImage
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

Adapt these models to the existing Prisma schema instead of blindly duplicating existing models.

---

# 8. DATABASE DESIGN REQUIREMENTS

All production-critical entities must have:

* Primary keys
* Appropriate foreign keys
* Unique constraints
* Appropriate indexes
* Created timestamps
* Updated timestamps
* Referential integrity
* Safe deletion behavior

Use database transactions for critical workflows.

Never rely exclusively on frontend validation.

---

# 9. PRODUCT SYSTEM

Products must be database-backed.

Each product should support:

* ID
* SKU
* Name
* Slug
* Description
* Category
* Brand
* Images
* Price
* Compare-at price
* Discount
* Tax category
* Stock
* Status
* Variants
* Attributes
* Rating
* Review count
* Creation date
* Update date

Prices must always come from the server during checkout.

Never trust a client-submitted price.

---

# 10. INVENTORY SYSTEM

Inventory must be concurrency-safe.

Example:

```text
Available inventory = 10

Customer A requests 7
Customer B requests 5
```

The system must NOT allow both requests to succeed.

Use transactional inventory updates or another safe concurrency mechanism.

Inventory must support:

* Available quantity
* Reserved quantity
* Sold quantity
* Reservation expiration
* Inventory adjustments
* Stock restoration after cancellation/refund where applicable

Implement an inventory reservation mechanism for checkout.

Example:

```text
Cart
 ↓
Checkout
 ↓
Reserve inventory
 ↓
Payment
 ↓
Payment verified
 ↓
Confirm order
```

If payment fails:

```text
Payment failed
 ↓
Release reservation
```

---

# 11. AUTHENTICATION

Use the existing Firebase Authentication integration if it is working correctly.

Required:

### Registration

* Name
* Email
* Password
* Password confirmation
* Optional phone

### Login

* Email
* Password
* Remember session
* Secure error handling
* Redirect support

### Email verification

* Verification email
* Verification status
* Resend protection
* Expiration handling

### Forgot password

The flow must actually work:

```text
Forgot Password
      ↓
Enter email
      ↓
Secure reset request
      ↓
Email sent
      ↓
Reset link
      ↓
New password
      ↓
Invalidate old sessions where appropriate
```

Never reveal whether an account exists through an unsafe error response.

---

# 12. SESSION SECURITY

Use secure server-side authentication mechanisms.

Requirements:

* HttpOnly cookies where applicable
* Secure cookies in production
* SameSite protection
* Server-side authorization
* Token validation
* Session expiration
* Logout
* Session revocation
* Protection against token misuse

Never expose Firebase Admin credentials to the browser.

---

# 13. ACCOUNT SYSTEM

Create a complete customer account area.

Routes should include:

```text
/account
/account/profile
/account/security
/account/addresses
/account/orders
/account/orders/[orderId]
/account/reviews
/account/returns
```

Users should be able to:

* View profile
* Edit profile
* Change password
* Manage addresses
* Set default address
* View orders
* Track orders
* Cancel eligible orders
* Request returns
* View reviews
* Manage sessions

Every resource must be authorized against the authenticated user.

User A must NEVER be able to access User B's order by changing an ID in the URL.

---

# 14. CART

The cart must be persistent and real.

Support:

* Add product
* Remove product
* Increase quantity
* Decrease quantity
* Stock validation
* Price refresh
* Product availability validation
* Cart persistence
* Guest cart where appropriate
* Merge guest cart into authenticated cart

Never trust cart prices submitted by the browser.

The server must recalculate totals.

---

# 15. CHECKOUT

Checkout must be a real transactional process.

Recommended flow:

```text
Cart
 ↓
Address Selection
 ↓
Shipping Selection
 ↓
Server Price Calculation
 ↓
Inventory Validation
 ↓
Inventory Reservation
 ↓
Payment Creation
 ↓
Payment
 ↓
Server Verification
 ↓
Order Confirmation
 ↓
Inventory Commit
 ↓
Notification
```

The client must never be allowed to directly determine:

* Final order total
* Payment status
* Order status
* Inventory quantity
* Discount amount

---

# 16. RAZORPAY

Use Razorpay for Indian payments.

Support:

* UPI
* Cards
* Netbanking
* Razorpay supported payment methods

Initially use Razorpay Test Mode.

Production must use production credentials stored securely.

Payment flow:

```text
Customer
 ↓
Apex Checkout
 ↓
Apex Server
 ↓
Create Razorpay Order
 ↓
Razorpay Checkout
 ↓
Payment
 ↓
Razorpay Response
 ↓
Apex Server
 ↓
Signature Verification
 ↓
Payment Record
 ↓
Order Confirmation
```

Never trust:

```text
paymentSuccess = true
```

from the frontend.

Implement server-side signature verification.

Implement webhook handling.

Webhook processing must be idempotent.

---

# 17. PAYMENT STATES

Support controlled payment states:

```text
CREATED
AUTHORIZED
CAPTURED
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

Payment state transitions must happen only through authorized server-side logic.

---

# 18. IDEMPOTENCY

This is mandatory for production.

Use idempotency protection for:

* Order creation
* Payment creation
* Payment verification
* Refund
* Cancellation
* Webhook processing

If a customer clicks Pay twice, the system must not create two orders.

Example:

```text
Request
 ↓
Idempotency Key
 ↓
Already processed?
 ├── YES → Return existing result
 └── NO → Process request
```

---

# 19. ORDER MANAGEMENT

Order lifecycle:

```text
PENDING_PAYMENT
      ↓
PAID
      ↓
CONFIRMED
      ↓
PROCESSING
      ↓
PACKED
      ↓
SHIPPED
      ↓
OUT_FOR_DELIVERY
      ↓
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

The customer cannot arbitrarily change order state.

Every important status transition should be recorded.

---

# 20. REAL ORDER TRACKING

Order tracking must be database-backed.

Each shipment should support:

* Shipment ID
* Order ID
* Carrier
* Tracking number
* Current status
* Estimated delivery
* Tracking events

Tracking events:

```text
ORDER_CONFIRMED
PACKED
PICKED_UP
IN_TRANSIT
ARRIVED_AT_HUB
OUT_FOR_DELIVERY
DELIVERED
```

Customer order tracking UI should display a timeline.

If real logistics API integration is not yet configured, create a clean shipping-provider abstraction so it can be connected without rewriting the order system.

Do NOT fake real courier tracking and present it as live tracking.

---

# 21. REAL-TIME UPDATES

Where appropriate, provide real-time updates for:

* Order status
* Payment status
* Inventory availability
* Notifications

Use an appropriate real-time mechanism such as:

* WebSockets
* Server-Sent Events
* Supabase Realtime if retained

Do not introduce unnecessary real-time infrastructure for data that does not require it.

---

# 22. REVIEWS

Reviews must be persisted in PostgreSQL.

Support:

* Rating
* Title
* Review body
* Verified purchase
* Helpful votes
* Reports
* Moderation status
* Created date
* Updated date

Verified Purchase must be determined server-side from actual order history.

The client must never be allowed to simply submit:

```json
{
  "verifiedPurchase": true
}
```

---

# 23. SEARCH

Search must use real database data.

Support:

* Keyword search
* Category
* Subcategory
* Price range
* Rating
* Brand
* Availability
* Discount
* Sorting

Start with PostgreSQL search/indexing where sufficient.

Do not introduce OpenSearch/Elasticsearch unless the current catalog size or search requirements justify it.

Architect the search layer so a dedicated search engine can be introduced later.

---

# 24. CACHING

Introduce Redis/Valkey only where useful.

Potential cached data:

* Product listings
* Categories
* Popular products
* Configuration
* Rate-limit counters
* Temporary checkout state

PostgreSQL remains the source of truth.

Never treat cache as authoritative order/payment storage.

---

# 25. ASYNCHRONOUS PROCESSING

Use a queue such as AWS SQS for tasks that do not need to block the customer's request.

Examples:

```text
Order placed
 ↓
SQS
 ├── Email confirmation
 ├── Invoice generation
 ├── Notification
 ├── Analytics
 └── Fulfillment event
```

This keeps checkout fast and reliable.

---

# 26. NOTIFICATION SYSTEM

Implement transactional notifications for:

* Account created
* Email verified
* Password reset
* Order placed
* Payment successful
* Payment failed
* Order packed
* Order shipped
* Out for delivery
* Delivered
* Cancelled
* Refund initiated
* Refund completed

Email infrastructure may use Amazon SES or another production transactional email provider.

---

# 27. FILE STORAGE

Product images and customer-uploaded media must not be stored directly inside PostgreSQL.

Use object storage such as:

```text
Amazon S3
```

Use CDN delivery through CloudFront where appropriate.

Validate uploaded files for:

* File type
* File size
* MIME type
* Filename safety
* Storage path safety

---

# 28. FRONTEND REDESIGN

The new frontend must be genuinely original.

Do not simply recolor the current interface.

Create:

* New design system
* New typography
* New layout hierarchy
* New navigation
* New product-card design
* New product-detail layout
* New checkout experience
* New account dashboard
* New order-tracking interface
* Responsive mobile experience
* Original interactions and animations

The interface should communicate Apex as an independent e-commerce brand.

Preserve good e-commerce usability patterns but do not create a pixel-for-pixel Amazon clone.

---

# 29. RESPONSIVE DESIGN

Support:

* Mobile
* Tablet
* Laptop
* Desktop
* Large desktop

Minimum expectation:

```text
320px+
768px+
1024px+
1440px+
```

Avoid horizontal overflow.

All major shopping journeys must work on mobile.

---

# 30. ACCESSIBILITY

Implement:

* Semantic HTML
* Keyboard navigation
* Focus states
* Accessible buttons
* Accessible forms
* Labels
* Error messages
* Appropriate ARIA attributes
* Color contrast
* Reduced-motion support where appropriate

---

# 31. ADMIN / OPERATIONS

Create an internal administration layer.

Admin capabilities should eventually include:

### Products

* Create product
* Edit product
* Disable product
* Manage images
* Manage variants
* Manage inventory

### Orders

* Search orders
* View order
* Update fulfillment state
* View payment state
* View shipment
* Process cancellation
* Process return/refund

### Customers

* Search customer
* View account
* View orders
* View support information

### Reviews

* Moderate
* Hide
* Restore
* Review reports

### Analytics

* Revenue
* Orders
* Customers
* Products
* Inventory
* Conversion metrics

All admin routes require server-side authorization.

---

# 32. SECURITY

Implement production security throughout the application.

Requirements:

* HTTPS
* Secure cookies
* CSRF protection where applicable
* XSS-safe rendering
* SQL injection protection through Prisma/parameterized queries
* Input validation
* Output validation
* Rate limiting
* Authentication
* Authorization
* Admin RBAC
* Secure file uploads
* Secret management
* Payment signature verification
* Webhook verification
* Audit logs
* Session revocation

Never expose:

* Database credentials
* Firebase Admin credentials
* Razorpay secrets
* AWS secrets
* Internal stack traces

---

# 33. RATE LIMITING

Protect:

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

Use Redis or another suitable distributed rate-limiting mechanism in production.

---

# 34. AWS PRODUCTION INFRASTRUCTURE

If AWS is selected for production, use:

```text
Route 53
CloudFront
AWS WAF
Application Load Balancer
ECS Fargate
RDS PostgreSQL
ElastiCache Redis/Valkey
S3
SQS
SES
Secrets Manager
CloudWatch
```

Do not expose RDS directly to the public internet.

Keep the database in private networking.

---

# 35. ENVIRONMENT MANAGEMENT

Create:

```text
.env.example
```

with documented variable names but NO real secrets.

Maintain separate environments:

```text
development
staging
production
```

Production secrets must never be committed to Git.

---

# 36. ERROR HANDLING

Implement:

* Global error boundary
* API error handler
* Database error handling
* Payment error handling
* Authentication error handling
* Empty states
* Retry states
* Offline/error UI where appropriate
* User-friendly messages

Never display raw internal errors to customers.

---

# 37. OBSERVABILITY

Implement production monitoring.

Track:

* API latency
* HTTP errors
* Database failures
* Payment failures
* Authentication failures
* Checkout failures
* Inventory conflicts
* Queue failures
* Worker failures
* CPU
* Memory
* Database connections
* Cache performance

Use:

```text
AWS CloudWatch
+
Sentry
```

or equivalent production tooling.

---

# 38. AUDIT LOGGING

Important events must be recorded.

Examples:

```text
LOGIN
LOGOUT
PASSWORD_CHANGED
ADDRESS_CREATED
ORDER_CREATED
PAYMENT_CREATED
PAYMENT_CAPTURED
ORDER_CANCELLED
REFUND_CREATED
ADMIN_ORDER_UPDATED
INVENTORY_ADJUSTED
```

Do not store sensitive credentials or payment secrets in audit logs.

---

# 39. BACKUPS

Configure:

* Automated PostgreSQL backups
* Point-in-time recovery where available
* Backup retention
* Recovery documentation
* Periodic restore testing

A backup must be tested, not merely created.

---

# 40. PERFORMANCE REQUIREMENTS

Target:

```text
100+ simultaneous active users
```

The application should be load-tested rather than relying on theoretical capacity.

Initial performance targets:

```text
Product API:          < 300 ms target
Search API:           < 500 ms target
Cart API:             < 300 ms target
Checkout API:         < 1 second target
Homepage response:    < 500 ms target
```

Payment-provider latency is excluded from the internal checkout API target.

These are engineering targets and must be measured.

---

# 41. LOAD TESTING

Use k6 or an equivalent load-testing framework.

Test:

### Test 1

100 concurrent visitors.

### Test 2

100 concurrent product requests.

### Test 3

100 concurrent searches.

### Test 4

100 users adding products to carts.

### Test 5

100 concurrent checkout attempts.

### Test 6

Multiple users attempting to purchase the final units of the same product.

Expected inventory behavior:

```text
Stock = 10

100 customers attempt purchase

Maximum successful allocation = 10
```

There must be no overselling.

---

# 42. TESTING STRATEGY

Implement:

### Unit tests

Test:

* Price calculations
* Discount calculations
* Inventory calculations
* Coupon validation
* Order state transitions

### Integration tests

Test:

* Authentication
* Database
* Orders
* Payments
* Inventory
* Reviews

### E2E tests

Test:

```text
Register
 ↓
Verify
 ↓
Login
 ↓
Browse
 ↓
Search
 ↓
Product
 ↓
Add to cart
 ↓
Checkout
 ↓
Payment
 ↓
Order
 ↓
Tracking
```

---

# 43. CI/CD

Create a GitHub Actions pipeline:

```text
Push
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
Build
 ↓
Security Checks
 ↓
Deploy Staging
 ↓
Validation
 ↓
Production Deployment
```

Production deployment must require successful checks.

---

# 44. DATABASE MIGRATIONS

Use Prisma migrations.

Never manually modify production schema without a migration process.

Before every migration:

1. Review migration.
2. Test in development.
3. Test in staging.
4. Backup production where appropriate.
5. Apply migration.
6. Verify application health.

---

# 45. API DOCUMENTATION

Document all production APIs.

For each endpoint document:

* Method
* URL
* Authentication
* Request body
* Parameters
* Response
* Error codes
* Authorization requirements
* Rate limits
* Idempotency requirements

Prefer OpenAPI/Swagger for a mature implementation.

---

# 46. SEO

Because Apex is an e-commerce website, implement:

* Metadata
* Dynamic product titles
* Descriptions
* Canonical URLs
* Open Graph
* Product structured data
* Breadcrumb structured data
* Sitemap
* Robots.txt
* Clean product URLs

---

# 47. BUSINESS REQUIREMENTS

The platform must support real commercial operation.

Do not design only for a demonstration.

The architecture must allow future implementation of:

* Multiple payment providers
* Multiple shipping providers
* Coupons
* Discounts
* Product variants
* Inventory locations
* Returns
* Refunds
* Customer support
* Analytics
* Promotions
* Loyalty
* Seller/merchant functionality if required later

---

# 48. IMPLEMENTATION RULES

Before coding:

1. Inspect the existing repository.
2. Generate an architecture report.
3. Identify reusable components.
4. Identify existing APIs.
5. Identify database schema.
6. Identify duplicate or conflicting systems.
7. Identify security weaknesses.
8. Identify missing production requirements.
9. Create an implementation plan.
10. Only then begin modifying code.

Do NOT start by blindly rewriting files.

---

# 49. DEVELOPMENT WORKFLOW

After every major change:

1. Keep the development server running.
2. Run the relevant tests.
3. Open the affected page in the browser.
4. Verify the actual UI.
5. Verify network/API requests.
6. Verify database changes where applicable.
7. Fix errors immediately.
8. Continue to the next module.

Never assume a feature works merely because the code compiles.

---

# 50. DATA INTEGRITY RULE

For every important user action ask:

```text
Where is the source of truth?
Who is authorized to perform this action?
Can two users perform it simultaneously?
What happens if the request is retried?
What happens if the server crashes halfway through?
What happens if the payment provider responds late?
What happens if the network disconnects?
```

Design the system accordingly.

---

# 51. PRODUCTION READINESS CHECKLIST

The application is NOT production-ready until:

### Frontend

* [ ] Responsive
* [ ] Accessible
* [ ] Original design
* [ ] Error states
* [ ] Loading states
* [ ] Empty states
* [ ] SEO

### Authentication

* [ ] Registration
* [ ] Login
* [ ] Logout
* [ ] Email verification
* [ ] Forgot password
* [ ] Reset password
* [ ] Session security
* [ ] Authorization

### Products

* [ ] Database-backed
* [ ] Search
* [ ] Filters
* [ ] Categories
* [ ] Variants
* [ ] Inventory

### Cart

* [ ] Persistent
* [ ] Server validation
* [ ] Stock validation
* [ ] Price validation

### Orders

* [ ] Real database persistence
* [ ] Transactional creation
* [ ] Idempotency
* [ ] State machine
* [ ] Cancellation
* [ ] Returns
* [ ] Refunds

### Payments

* [ ] Razorpay integration
* [ ] Server-side verification
* [ ] Webhooks
* [ ] Idempotency
* [ ] Failure handling

### Shipping

* [ ] Shipment model
* [ ] Tracking number
* [ ] Tracking events
* [ ] Carrier abstraction

### Infrastructure

* [ ] Production database
* [ ] HTTPS
* [ ] Secrets management
* [ ] Backups
* [ ] Monitoring
* [ ] Logging
* [ ] Rate limiting
* [ ] CDN
* [ ] WAF
* [ ] Scaling

### Testing

* [ ] Unit tests
* [ ] Integration tests
* [ ] E2E tests
* [ ] Load tests
* [ ] Concurrency tests
* [ ] Payment tests
* [ ] Recovery tests

---

# 52. IMPORTANT IMPLEMENTATION CONSTRAINT

Do NOT over-engineer the system simply to make it look like Amazon.

The goal is:

> **Production correctness first, scalability second, unnecessary complexity last.**

For the current business size, a well-designed modular monolith is preferred over premature microservices.

The application should be capable of scaling horizontally when required without requiring a complete rewrite.

---

# 53. FINAL DELIVERABLE

After implementation, produce:

### Technical Documentation

```text
ARCHITECTURE.md
DATABASE.md
API.md
AUTHENTICATION.md
PAYMENTS.md
ORDERS.md
INVENTORY.md
DEPLOYMENT.md
SECURITY.md
LOAD-TESTING.md
```

### Environment

```text
.env.example
```

### Testing

Include documented results for:

```text
npm run lint
npm run typecheck
npm test
npm run build
load tests
E2E tests
```

### Final report

Include:

* Architecture
* Technology stack
* Database
* Authentication
* Products
* Cart
* Checkout
* Payments
* Orders
* Tracking
* Reviews
* Security
* Infrastructure
* Testing
* Scalability
* Deployment
* Known limitations

---

# 54. FINAL SUCCESS CRITERIA

The final Apex platform should behave like a real e-commerce application, not a static frontend demo.

A customer must be able to:

```text
Visit Apex
   ↓
Browse real products
   ↓
Search
   ↓
Open product
   ↓
Add to cart
   ↓
Register/Login
   ↓
Add address
   ↓
Checkout
   ↓
Pay using Razorpay
   ↓
Receive confirmed order
   ↓
View order
   ↓
Track shipment
   ↓
Receive status updates
   ↓
Receive delivery
   ↓
Review product
```

All critical information in this flow must originate from real backend systems and persistent data.

---

# 55. FIRST ACTION

Before modifying anything, inspect the existing Apex repository and produce:

1. Current architecture map
2. Existing frontend routes
3. Existing API routes
4. Existing Prisma schema
5. Existing Firebase implementation
6. Existing Razorpay implementation
7. Existing order flow
8. Existing inventory logic
9. Existing authentication flow
10. Existing deployment configuration
11. Existing tests
12. Missing production requirements
13. Potential security vulnerabilities
14. Duplicate/conflicting implementations

Then create a **gap analysis**:

```text
EXISTING
   ↓
PRODUCTION REQUIRED
   ↓
GAP
   ↓
IMPLEMENTATION
```

Do not rewrite the project until this analysis is complete.

Preserve working functionality wherever possible and improve only where necessary.

The final result must be a **real, database-backed, authenticated, payment-enabled, order-capable, scalable Apex e-commerce platform suitable for eventual commercial launch**, not a mock e-commerce demonstration.
