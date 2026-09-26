# 🛍️ Pehno — The Future of AI-Powered E-Commerce

<div align="center">
  <img src="./project-apex/image/1.png" alt="Pehno Homepage Banner" style="border-radius: 12px; margin-bottom: 20px;" width="100%"/>
</div>

Welcome to **Pehno**! Pehno is a state-of-the-art e-commerce platform that blends a stunning, modern user interface with advanced Artificial Intelligence. From an AI-driven personal stylist to lightning-fast seamless checkouts, Pehno delivers a premium shopping experience tailored specifically for the modern consumer.

---

## ✨ Key Features

- 🤖 **AI Personal Stylist**: Describe your occasion, and the built-in AI will intelligently curate a full outfit from our catalog just for you.
- 🎨 **Premium Aesthetic**: A carefully crafted UI utilizing glassmorphism, fluid micro-animations, and dynamic layout design for maximum engagement.
- 💳 **Secure Checkout**: Seamless integration with Razorpay (UPI, Cards, NetBanking) alongside Simulated Sandbox payments and Cash on Delivery.
- 🔐 **Robust Authentication**: Powered by Firebase and Better-Auth to ensure secure, fast, and reliable user login and session management.
- ⚡ **Lightning Fast Performance**: Frontend optimized with Next.js App Router and Server Components, backed by a highly concurrent Node.js/Express architecture.
- 📦 **End-to-End Order Management**: Real-time cart synchronization, detailed order tracking, and integrated inventory locking systems.

---

## 🛠️ Technology Stack

Pehno is built utilizing a decoupled architecture to ensure massive scalability and unmatched performance:

### Frontend
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS for custom animations
- **State Management**: Zustand
- **Icons**: Lucide React

### Backend & Database
- **Server**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) hosted on Render
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/) & Better-Auth

### Third-Party Integrations
- **Payments**: Razorpay API
- **AI Processing**: Google Gemini API
- **Logistics**: Shiprocket API

---

## 📸 Platform Gallery

Take a look at the beautiful UI and powerful features of the Pehno platform:

<div align="center">
  <img src="./project-apex/image/2.png" alt="Pehno UI" width="48%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/3.png" alt="Pehno UI" width="48%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/4.png" alt="Pehno UI" width="48%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/5.png" alt="Pehno UI" width="48%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/6.png" alt="Pehno UI" width="48%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/7.png" alt="Pehno UI" width="48%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/8.png" alt="Pehno UI" width="48%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/9.png" alt="Pehno UI" width="48%" style="margin: 1%; border-radius: 8px;"/>
</div>

### Shopping, AI & Checkout Flow
<div align="center">
  <img src="./project-apex/image/10.png" alt="Pehno App Flow" width="31%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/11.png" alt="Pehno App Flow" width="31%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/12.png" alt="Pehno App Flow" width="31%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/13.png" alt="Pehno App Flow" width="31%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/14.png" alt="Pehno App Flow" width="31%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/15.png" alt="Pehno App Flow" width="31%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/16.png" alt="Pehno App Flow" width="31%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/17.png" alt="Pehno App Flow" width="31%" style="margin: 1%; border-radius: 8px;"/>
  <img src="./project-apex/image/18.png" alt="Pehno App Flow" width="31%" style="margin: 1%; border-radius: 8px;"/>
</div>

---

## 🚀 Getting Started Locally

To run the Pehno platform on your local machine, follow these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/sharsh07-dev/8x.git
cd 8x/project-apex
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```
Ensure you provide your PostgreSQL `DATABASE_URL`, `NEXT_PUBLIC_FIREBASE_API_KEY`, and `RAZORPAY_KEY_ID`.

### 4. Database Setup & Seeding
Push the database schema and populate it with thousands of mock products:
```bash
npx prisma db push
npx tsx scripts/seed-mock-products.ts
```

### 5. Run the Application
Start the frontend and backend simultaneously:
```bash
npm run dev
```

Visit `http://localhost:3000` to experience Pehno!
