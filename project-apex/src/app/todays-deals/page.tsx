'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { mockProducts } from '@/data/mockProducts';
import ProductCard from '@/components/ProductCard';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import {
  Sparkles,
  Clock,
  Flame,
  Tag,
  Percent,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function TodaysDealsPage() {
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'DISCOUNT' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('DISCOUNT');

  // Simulated live countdown timer for flash deals
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 24, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter deal-eligible products
  const dealProducts = useMemo(() => {
    return mockProducts.filter((p) => {
      // Must have active deal or original price discount
      const hasActiveDeal = p.deal?.active || (p.originalPrice && p.originalPrice > p.price);
      if (!hasActiveDeal) return false;

      // Department filter
      if (selectedDept !== 'ALL' && p.department !== selectedDept) {
        return false;
      }

      // Discount threshold
      const discountPct = p.deal?.discountPercent || (p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0);
      if (discountPct < minDiscount) return false;

      return true;
    }).sort((a, b) => {
      const discA = a.deal?.discountPercent || (a.originalPrice ? Math.round(((a.originalPrice - a.price) / a.originalPrice) * 100) : 0);
      const discB = b.deal?.discountPercent || (b.originalPrice ? Math.round(((b.originalPrice - b.price) / b.originalPrice) * 100) : 0);

      switch (sortBy) {
        case 'PRICE_ASC':
          return a.price - b.price;
        case 'PRICE_DESC':
          return b.price - a.price;
        case 'RATING':
          return b.rating - a.rating;
        case 'DISCOUNT':
        default:
          return discB - discA;
      }
    });
  }, [selectedDept, minDiscount, sortBy]);

  // Featured Deal of the Day
  const featuredDeal = mockProducts.find((p) => p.id === 'prod-1') || mockProducts[0];

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Today's Deals" }]} />

        {/* Deals Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 text-white p-6 sm:p-10 mb-8 shadow-md">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold mb-3">
              <Flame className="w-3.5 h-3.5 text-red-400" /> Apex Flash Deals &amp; Savings
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Today's Best Deals &amp; Steals
            </h1>

            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed mb-6 max-w-lg">
              Save big on electronics, fashion, kitchen appliances, and grooming tools. Verified discounts updated hourly with Prime 1-day delivery.
            </p>

            {/* Flash Deal Countdown Timer */}
            <div className="inline-flex items-center gap-2.5 bg-black/40 backdrop-blur-xs border border-white/10 px-4 py-2 rounded-lg text-xs">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-gray-300">Deals refresh in:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Featured Deal Spotlight Card */}
        {featuredDeal && (
          <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white font-black text-xs px-4 py-1.5 rounded-bl-lg uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Deal of the Day
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 h-48 sm:h-56 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <Image
                  src={featuredDeal.image}
                  alt={featuredDeal.title}
                  fill
                  className="object-contain p-4"
                />
              </div>

              <div className="md:col-span-8 space-y-3">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                  {featuredDeal.deal?.dealLabel || 'Limited Time Deal'}
                </span>
                <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                  {featuredDeal.title}
                </h2>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-red-700">
                    ${featuredDeal.price.toFixed(2)}
                  </span>
                  {featuredDeal.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      List: ${featuredDeal.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="bg-red-100 text-red-800 text-xs font-black px-2 py-0.5 rounded">
                    Save {featuredDeal.deal?.discountPercent || 25}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{featuredDeal.description}</p>
                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href={`/products/${featuredDeal.id}`}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>Claim Deal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Prime Free One-Day Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deals Filter & Sort Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6 space-y-3">
          {/* Department Shortcuts */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="font-bold text-gray-700 shrink-0 mr-1">Department:</span>
            {[
              { id: 'ALL', label: 'All Deals' },
              { id: 'electronics', label: 'Electronics' },
              { id: 'clothing', label: 'Clothing & Fashion' },
              { id: 'home-kitchen', label: 'Home & Kitchen' },
              { id: 'beauty', label: 'Beauty' },
              { id: 'sports', label: 'Sports & Fitness' },
              { id: 'books', label: 'Books' },
            ].map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDept(dept.id)}
                className={`px-3 py-1.5 rounded-full font-bold transition shrink-0 ${
                  selectedDept === dept.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
            {/* Minimum Discount Filter */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Discount:</span>
              {[0, 15, 25, 35].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setMinDiscount(pct)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                    minDiscount === pct
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pct === 0 ? 'All Discounts' : `${pct}% off or more`}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold bg-white text-gray-800 outline-none cursor-pointer"
              >
                <option value="DISCOUNT">Biggest Savings %</option>
                <option value="PRICE_ASC">Price: Low to High</option>
                <option value="PRICE_DESC">Price: High to Low</option>
                <option value="RATING">Avg. Customer Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deals Product Grid */}
        <div className="space-y-4">
          <div className="text-xs text-gray-600">
            Showing <strong className="text-gray-900">{dealProducts.length}</strong> active deals
          </div>

          {dealProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-3">
              <Tag className="w-10 h-10 text-gray-400 mx-auto" />
              <h3 className="font-bold text-gray-900">No deals match your selected filters</h3>
              <p className="text-xs text-gray-500">
                Try lowering your discount threshold or selecting All Deals.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedDept('ALL');
                  setMinDiscount(0);
                }}
                className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-lg"
              >
                Reset Deals Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {dealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
