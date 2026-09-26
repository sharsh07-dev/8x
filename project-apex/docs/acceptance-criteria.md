# Project Apex - Acceptance Criteria

## General System Constraints
- **AC-GEN-1**: The application must compile and run without critical errors at all times (`npm run build` succeeds).
- **AC-GEN-2**: Client-side prices must NEVER be trusted; all calculations must happen server-side.
- **AC-GEN-3**: The UI must be responsive and follow the established Apex design system.

## 1. Authentication
- **AC-AUTH-1**: User can register with valid email and secure password.
- **AC-AUTH-2**: User can log in and receive a secure HTTP-only session cookie.
- **AC-AUTH-3**: Unauthenticated users cannot access protected routes (e.g., `/account`, `/checkout`).
- **Failure Case**: Invalid credentials return generic "Invalid email or password" error. Brute force attempts are rate-limited.

## 2. Product Catalog
- **AC-CAT-1**: Products load dynamically from the PostgreSQL database (not static mocks).
- **AC-CAT-2**: Product details display correct variant options, images, and live stock status.
- **Failure Case**: Requesting an invalid product ID renders a custom 404/Not Found state.

## 3. Search & Discovery
- **AC-SEARCH-1**: Users can filter by category, and the URL updates (e.g., `?category=electronics&sort=price_asc`).
- **AC-SEARCH-2**: URL sharing preserves the exact filter state.
- **Failure Case**: Searches with no matches display a clear "No products found" empty state.

## 4. Cart
- **AC-CART-1**: Users can add, remove, and update quantities of items.
- **AC-CART-2**: Attempting to add more items than available stock triggers an inline error and prevents the action.
- **AC-CART-3**: Cart persists across sessions for logged-in users.

## 5. Inventory Concurrency (CRITICAL)
- **AC-INV-1**: When checkout is initiated, stock is reserved for 10 minutes.
- **AC-INV-2**: If 100 users try to checkout an item with stock 5, exactly 5 reservations succeed and 95 fail gracefully with a "Out of stock" message.
- **Failure Case**: Expired reservations automatically return stock to the available pool.

## 6. Checkout & Payments
- **AC-PAY-1**: Checkout initiation creates an immutable order intent and a Razorpay order.
- **AC-PAY-2**: Successful Razorpay frontend payment triggers a webhook to the backend.
- **AC-PAY-3**: Backend verifies Razorpay webhook signature before marking the order as `PAID`.
- **AC-PAY-4**: Duplicate webhooks are ignored (idempotency).
- **Failure Case**: Failed payments update order status to `PAYMENT_FAILED` without losing the cart contents.

## 7. Orders & Shipping
- **AC-ORD-1**: Paid orders generate an immutable snapshot of items and prices.
- **AC-ORD-2**: Shiprocket AWB is generated for confirmed orders (where applicable).
- **Failure Case**: If logistics API fails, order remains in `CONFIRMED` state for manual retry.

## 8. Reviews
- **AC-REV-1**: Only users with a `DELIVERED` order for a product can leave a verified review.
- **AC-REV-2**: Users can vote a review as helpful.
- **Failure Case**: Attempting to review an unpurchased item is blocked by the server.

## 9. Security & Admin
- **AC-SEC-1**: Admin routes (`/admin/*`) strictly verify admin roles server-side.
- **AC-SEC-2**: Sensitive data (passwords, payment keys) are never exposed to the client bundle.
