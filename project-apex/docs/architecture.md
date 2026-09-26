# System Architecture

## 1. High-Level Architecture
Project Apex operates on a **Decoupled Architecture**:
1. **Frontend**: A Next.js (App Router) application responsible purely for UI rendering, client-side routing, and presentation.
2. **Backend API**: A standalone Node.js/Express.js application providing a RESTful API, acting as the authoritative source of truth.
3. **Database**: PostgreSQL (managed via Prisma ORM) for persistent, relational data storage.
4. **Cache & Queues**: Redis for high-speed caching, short-lived states (idempotency, rate limits), and background job queuing.
5. **Infrastructure**: Hosted on AWS (ECS/Fargate for compute, RDS for Postgres, ElastiCache for Redis).

## 2. Technology Stack
### Frontend
- **Framework**: Next.js (App Router), React 19.
- **Language**: TypeScript (Strict mode).
- **Styling**: Tailwind CSS v4.
- **State Management**: Zustand (for responsive client state like Cart UI; backend remains authoritative).
- **Icons**: Lucide React.
- **Animations**: GSAP (sparingly, for premium interactions).

### Backend
- **Runtime**: Node.js.
- **Framework**: Express.js.
- **Language**: TypeScript (Strict mode).
- **ORM**: Prisma.
- **Database**: PostgreSQL.

### Third-Party Services
- **Authentication**: Firebase Authentication (Client-side login -> Server-side token verification).
- **Payments**: Razorpay (Test Mode initially).
- **Logistics**: Shiprocket (for AWB and tracking).
- **Email**: AWS SES / Resend.

## 3. Modular Monolith Design
While decoupled from the frontend, the backend will be structured as a **Modular Monolith**. It avoids premature microservices. 
Modules (e.g., `Catalog`, `Orders`, `Users`, `Payments`) will have strict boundaries, interacting through defined service interfaces, making future extraction into microservices easy if scaling demands it.
