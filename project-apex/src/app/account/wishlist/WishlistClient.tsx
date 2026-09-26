'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, X } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types/product';

export default function WishlistClient({ initialWishlist }: { initialWishlist: Product[] }) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F9F6F1]">
        <div className="w-8 h-8 border-4 border-[#E67661] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Unauthenticated State (Matching the User's Screenshot) ──
  if (!session?.user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4">
        <h1 className="text-[22px] font-black text-[#171717] mb-2 uppercase tracking-wide">
          Please Log In
        </h1>
        <p className="text-[#6B7280] text-base mb-14">
          Login to view items in your wishlist.
        </p>
        
        {/* Mock Illustration matching the screenshot */}
        <div className="relative w-36 h-44 mb-16 flex items-center justify-center">
           {/* Background cards */}
           <div className="absolute inset-0 border-[3px] border-[#69E2C6] rounded-xl transform -rotate-3 opacity-60" />
           <div className="absolute inset-0 border-[3px] border-[#69E2C6] rounded-xl transform rotate-3 bg-white" />
           
           {/* Center Icon Graphic */}
           <div className="relative z-10 flex flex-col items-center justify-center gap-1">
             <div className="flex items-center justify-center gap-1">
                <div className="w-4 h-4 bg-[#FCD34D] rounded-full" />
                <div className="w-6 h-2 bg-[#FCD34D] rounded-full" />
             </div>
             <div className="w-8 h-2 bg-[#FCD34D] rounded-full mt-1" />
           </div>

           {/* Floating elements */}
           <div className="absolute top-4 right-4 w-3 h-3 bg-[#69E2C6] rounded-sm opacity-50" />
           <div className="absolute bottom-6 left-6 text-[#E3E1DD] font-black text-xl">✦</div>
        </div>

        <Link 
          href="/login"
          className="inline-block px-14 py-3.5 border-2 border-[#4A6BFF] text-[#4A6BFF] font-bold text-lg rounded-[4px] hover:bg-blue-50 transition-colors uppercase tracking-wider"
        >
          Login
        </Link>
      </div>
    );
  }

  // ── Authenticated State ──
  const wishlistItems = initialWishlist; // Simulated Wishlist

  return (
    <div className="bg-[#F9F6F1] min-h-screen">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-[#171717] mb-8">
          My Wishlist <span className="text-[#6B7280] text-xl font-normal ml-2">({wishlistItems.length} items)</span>
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map(product => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <button 
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md z-20 text-[#E67661] hover:bg-[#E67661] hover:text-white transition-colors"
                title="Remove from wishlist"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
