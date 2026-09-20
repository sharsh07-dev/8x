import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Zap, Shield, Globe } from 'lucide-react';

export const metadata = {
  title: 'About Us - Project Apex',
  description: 'Learn about the mission, technology, and engineering of Project Apex.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-10 space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#007185] hover:underline mb-4 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Apex Storefront
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-tight text-[#131921]">
              apex<span className="text-[#f08804]">.</span>
            </span>
            <span className="text-xs bg-[#f08804] text-[#131921] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
              Prime
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
            About Project Apex
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Engineered for performance, customer satisfaction, and modern retail excellence.
          </p>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-4 leading-relaxed">
          <p>
            Project Apex is a modern, full-stack e-commerce marketplace platform built with Next.js 16, React 19,
            PostgreSQL, Prisma ORM, and Razorpay. Designed from the ground up to offer the speed, reliability,
            and intuitive navigation of leading global storefronts.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 border border-gray-100 rounded-lg bg-gray-50 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-[#f08804]">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Instant Performance</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ultra-fast server rendering, client caching with Zustand, and sub-second page transitions.
            </p>
          </div>

          <div className="p-5 border border-gray-100 rounded-lg bg-gray-50 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-[#007185]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Transactional Integrity</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              PostgreSQL database transactions for order creation, inventory reservations, and idempotent payments.
            </p>
          </div>

          <div className="p-5 border border-gray-100 rounded-lg bg-gray-50 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Customer-Centric</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Verified purchase reviews, real-time tracking, seamless returns, and comprehensive departments.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
          <span>Explore our departments</span>
          <Link href="/departments" className="text-[#007185] hover:underline font-semibold">
            View All Departments &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
