# API Architecture

## 1. Request Lifecycle
The backend Express application follows a strict layered architecture:
```text
Client Request
      ↓
Route Definition (Express Router)
      ↓
Middleware (Auth, Rate Limit, Validation)
      ↓
Controller (HTTP logic, destructuring, standardizing responses)
      ↓
Service (Business logic, calculations, orchestration)
      ↓
Repository (Database access abstraction)
      ↓
Prisma ORM
      ↓
PostgreSQL
```

## 2. Core Principles
- **Separation of Concerns**: Controllers handle HTTP (status codes, headers). Services handle business rules. Repositories handle database queries.
- **Validation**: All incoming requests (body, query, params) must be validated using **Zod** at the Middleware level before reaching the Controller.
- **Standardized Responses**:
  - Success: `{ "success": true, "data": { ... } }`
  - Error: `{ "success": false, "error": { "code": "NOT_FOUND", "message": "Product not found" } }`

## 3. API Module Boundaries
- `/api/v1/auth`: Token verification, session creation, profile management.
- `/api/v1/catalog`: Products, Categories, Collections (Read-heavy, heavily cached).
- `/api/v1/cart`: Cart synchronization, validation.
- `/api/v1/checkout`: Pricing, inventory reservation, order intent creation.
- `/api/v1/payments`: Razorpay initialization and Webhooks.
- `/api/v1/orders`: Order history, tracking.
- `/api/v1/reviews`: Submitting and fetching reviews.

## 4. Error Handling
- A centralized error-handling middleware will catch all thrown errors and format them into the standardized error response.
- Business logic should throw specific custom errors (e.g., `InsufficientStockError`, `UnauthorizedError`) which the middleware understands.
