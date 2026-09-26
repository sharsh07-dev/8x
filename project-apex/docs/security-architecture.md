# Security Architecture

## 1. Authentication & Identity
- **Never trust client-provided IDs**: User identity is ALWAYS derived from the server-side verification of the authentication token (Firebase JWT or secure session cookie).
- **Session Management**: JWTs/Cookies will be HTTP-only, secure, and SameSite=strict.
- **No Secrets in Code**: All API keys, secrets, and database URIs must be injected via environment variables.

## 2. Authorization
- **Role-Based Access Control (RBAC)**: Defined on the server. `ADMIN` vs `CUSTOMER`.
- Middleware enforces authorization before the controller is executed.
- Frontend hides admin buttons, but backend enforces the actual security boundary.

## 3. Threat Mitigation
- **Rate Limiting**: Redis-backed rate limiting applied globally, with stricter limits on auth and payment routes.
- **Brute-Force Protection**: Account lockout mechanisms for failed login attempts.
- **Data Validation**: Strict Zod schemas prevent SQL injection and NoSQL injection. Prisma inherently protects against SQL injection.
- **XSS & CSRF**: Handled via proper content-type headers, React's built-in escaping, and CSRF tokens for mutating requests where applicable.

## 4. Payment & Financial Security
- **Idempotency**: All checkout and payment routes must use an Idempotency Key to prevent double-charging due to network retries.
- **Webhook Verification**: Razorpay webhooks MUST be verified using the `razorpay_signature` mechanism. Never assume a webhook is authentic based solely on the payload.
- **Server-Side Pricing**: The client cart is visual only. Final prices, discounts, and taxes are strictly calculated by the backend Service layer during checkout.

## 5. Audit & Logging
- **Sensitive Data**: Passwords, payment secrets, and PII are NEVER logged.
- **Security Events**: Important actions (login, password reset, admin changes) are logged to the `SecurityEvent` table.
