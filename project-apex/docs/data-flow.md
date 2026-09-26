# System Data Flow

## 1. Checkout & Payment Flow (Critical Path)
```text
1. Frontend User clicks "Place Order".
2. Frontend requests POST `/api/v1/checkout/initiate` (with idempotency key).
3. Backend validates cart against Database prices (not client prices).
4. Backend initiates Transaction:
   a. Attempts to reserve inventory in `ProductInventory` (Row-level lock).
   b. If stock insufficient -> Rollback, return Error.
   c. If stock sufficient -> Create `Order` in `PENDING_PAYMENT` state.
5. Backend creates a Razorpay Order ID.
6. Backend returns Order + Razorpay details to Frontend.
7. Frontend opens Razorpay Checkout UI.
8. User completes payment successfully.
9. Frontend sends success signal -> Backend ignores/waits for Webhook (Truth).
10. Razorpay fires Webhook `payment.captured` to `/api/v1/payments/webhook`.
11. Backend Webhook Handler:
    a. Verifies cryptographic signature.
    b. Checks idempotency (has this webhook been processed?).
    c. Updates `Payment` status to `PAID`.
    d. Updates `Order` status to `CONFIRMED`.
    e. Commits inventory deduction permanently.
12. Backend queues Email Notification (via Redis/SQS).
```

## 2. Authentication Flow
```text
1. User enters credentials on Frontend.
2. Firebase Client SDK authenticates and returns an ID Token.
3. Frontend sends ID Token to Backend `/api/v1/auth/session`.
4. Backend uses Firebase Admin SDK to verify the ID Token.
5. Backend looks up or creates `User` in PostgreSQL.
6. Backend generates a secure, HTTP-only session cookie.
7. Frontend uses cookie for all subsequent authenticated requests.
```

## 3. Inventory Concurrency Flow
```text
When User A and User B attempt to buy the last 1 item:
1. Both requests hit the Checkout Service.
2. Both initiate a PostgreSQL Transaction.
3. Request A acquires the lock on `ProductInventory` row.
4. Request A reads stock (1), decrements to (0), and commits.
5. Request B acquires the lock.
6. Request B reads stock (0).
7. Request B throws `InsufficientStockError`, transaction rolls back.
8. User A proceeds to payment. User B gets an "Out of stock" error.
```
