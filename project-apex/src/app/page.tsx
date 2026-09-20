'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones,
  ArrowRight
} from 'lucide-react';
import { mockProducts } from '@/data/mockProducts';
import ProductCard from '@/components/ProductCard';
import { useSession, signOut } from '@/lib/auth-client';

export default function Home() {
  const { data: session } = useSession();
  const [heroIndex, setHeroIndex] = useState(0);

  const heroBanners = [
    {
      title: 'Spring Tech Savings Event',
      subtitle: 'Up to 40% off premium audio, smart watches, and home essentials.',
      cta: 'Explore All Deals',
      badge: 'Limited Time Deal',
      gradient: 'from-slate-900 via-indigo-950 to-blue-900',
      tagline: 'Delivered fast with Prime.'
    },
    {
      title: 'Upgrade Your Home Workspace',
      subtitle: 'Ergonomic mice, mechanical keyboards, and 4K monitors ready to ship.',
      cta: 'Shop Workstations',
      badge: 'New Arrivals',
      gradient: 'from-blue-950 via-slate-900 to-teal-950',
      tagline: 'Top picks reviewed by thousands.'
    },
    {
      title: 'Next-Gen Audio Experience',
      subtitle: 'Active noise cancellation headphones with lossless audio fidelity.',
      cta: 'Listen Now',
      badge: 'Featured Brands',
      gradient: 'from-stone-900 via-zinc-900 to-amber-950',
      tagline: 'Risk-free 30-day returns.'
    }
  ];

  const handleNextHero = () => {
    setHeroIndex((prev) => (prev + 1) % heroBanners.length);
  };

  const handlePrevHero = () => {
    setHeroIndex((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
  };

  return (
    <div className="min-h-screen bg-[#e3e6e6] pb-16">
      {/* Hero Banner Section */}
      <div className="relative">
        <div className={`relative min-h-[460px] sm:min-h-[500px] md:min-h-[540px] w-full bg-gradient-to-r ${heroBanners[heroIndex].gradient} transition-all duration-700 flex flex-col justify-start pt-8 sm:pt-12 md:pt-14 pb-28 md:pb-36`}>
          {/* Subtle background texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Banner Text Content */}
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full z-10">
            <div className="max-w-xl space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#febd69] text-[#131921] shadow-sm uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {heroBanners[heroIndex].badge}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {heroBanners[heroIndex].title}
              </h1>
              <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-normal">
                {heroBanners[heroIndex].subtitle}
              </p>
              <div className="pt-2 flex items-center gap-4">
                <Link 
                  href="/todays-deals"
                  className="inline-flex items-center gap-2 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  {heroBanners[heroIndex].cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-xs text-gray-300 hidden sm:inline-block font-medium">
                  {heroBanners[heroIndex].tagline}
                </span>
              </div>
            </div>
          </div>

          {/* Carousel Arrows */}
          <button 
            onClick={handlePrevHero}
            className="absolute left-2 sm:left-4 top-36 sm:top-40 -translate-y-1/2 p-2.5 rounded-md bg-black/25 hover:bg-black/50 text-white transition-colors cursor-pointer z-20"
            aria-label="Previous Banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNextHero}
            className="absolute right-2 sm:right-4 top-36 sm:top-40 -translate-y-1/2 p-2.5 rounded-md bg-black/25 hover:bg-black/50 text-white transition-colors cursor-pointer z-20"
            aria-label="Next Banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Bottom Gradient Fade to merge smoothly into cards */}
          <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#e3e6e6] via-[#e3e6e6]/70 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Main Content Area: Category Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative -mt-16 sm:-mt-24 md:-mt-28 z-20 space-y-8">
        {/* Category Teaser Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Top Deals in Audio</h2>
              <div className="w-full h-44 bg-gray-50 rounded overflow-hidden mb-3">
                <img 
                  src={mockProducts[0].image} 
                  alt="Audio deals" 
                  className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform"
                />
              </div>
            </div>
            <Link href="/electronics/audio" className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1">
              Shop audio deals <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Refresh Your Space</h2>
              <div className="w-full h-44 bg-gray-50 rounded overflow-hidden mb-3">
                <img 
                  src={mockProducts[5].image} 
                  alt="Home essentials" 
                  className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform"
                />
              </div>
            </div>
            <Link href="/home-kitchen" className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1">
              Shop kitchen &amp; dining <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Clothing &amp; Fashion</h2>
              <div className="w-full h-44 bg-gray-50 rounded overflow-hidden mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80" 
                  alt="Clothing and fashion" 
                  className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform"
                />
              </div>
            </div>
            <Link href="/clothing" className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1">
              Explore fashion <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 4: Sign In / Account Quick Box */}
          <div className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
            {session?.user ? (
              <>
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#f08804]/15 border border-[#f08804]/30 flex items-center justify-center text-[#f08804] font-bold text-base shrink-0">
                      {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <h2 className="text-sm font-bold text-gray-900 truncate">
                        Hi, {session.user.name || 'Customer'}
                      </h2>
                      <p className="text-[11px] text-gray-500 truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    Track your shipments, review recent orders, and manage your account security.
                  </p>
                  <div className="space-y-2 mb-3">
                    <Link 
                      href="/account/orders"
                      className="w-full block text-center bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold py-2 rounded-full text-xs shadow-sm cursor-pointer transition-colors"
                    >
                      Your Orders
                    </Link>
                    <Link 
                      href="/account"
                      className="w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-1.5 rounded-full text-xs border border-gray-300 shadow-sm cursor-pointer transition-colors"
                    >
                      Manage Account
                    </Link>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-xs">
                  <Link href="/account/addresses" className="font-semibold text-[#007185] hover:text-[#c7511f] hover:underline">
                    Your Addresses
                  </Link>
                  <button 
                    onClick={() => signOut().then(() => window.location.reload())}
                    className="text-gray-500 hover:text-red-600 hover:underline text-xs cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Sign in for the best experience</h2>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    Enjoy personalized recommendations, track orders in real time, and access Prime shipping perks.
                  </p>
                  <Link 
                    href="/login"
                    className="w-full block text-center bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold py-2 rounded-full text-xs shadow-sm cursor-pointer mb-3"
                  >
                    Sign in securely
                  </Link>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">New customer? </span>
                  <Link href="/register" className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline">
                    Start here.
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Feature Trust Perks Bar */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 text-center">
          <div className="flex items-center justify-center gap-3 p-2">
            <Truck className="w-6 h-6 text-[#f08804]" />
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900">Fast & Free Delivery</p>
              <p className="text-[11px] text-gray-500">Free shipping on Prime items</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-2">
            <ShieldCheck className="w-6 h-6 text-[#f08804]" />
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900">Buyer Protection</p>
              <p className="text-[11px] text-gray-500">100% verified authentic items</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-2">
            <RotateCcw className="w-6 h-6 text-[#f08804]" />
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900">Easy Returns</p>
              <p className="text-[11px] text-gray-500">30 days return policy</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 p-2">
            <Headphones className="w-6 h-6 text-[#f08804]" />
            <div className="text-left">
              <p className="text-xs font-bold text-gray-900">24/7 Dedicated Help</p>
              <p className="text-[11px] text-gray-500">Instant customer support</p>
            </div>
          </div>
        </div>

        {/* Today's Deals & Trending Products Grid */}
        <div id="catalog" className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Recommended For You
              </h2>
              <span className="text-xs bg-[#f08804]/10 text-[#f08804] font-bold px-2 py-0.5 rounded-full">
                Live Catalog
              </span>
            </div>
            <Link href="#all" className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline">
              View all 8 items
            </Link>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
