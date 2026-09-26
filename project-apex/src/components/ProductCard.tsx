'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Check, ShoppingBag, AlertCircle, Sparkles } from 'lucide-react';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  product: Product;
  showAiReason?: boolean;
  aiReason?: string;
}

export default function ProductCard({ product, showAiReason, aiReason }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const isAvailable = product.inStock && product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;

    addToCart(product, 1, false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const discountPct = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const ratingFull  = Math.floor(product.rating);
  const ratingHalf  = product.rating % 1 >= 0.5;

  return (
    <article className="group bg-white rounded-xl border border-[#E3E1DD] overflow-hidden flex flex-col h-full w-full transition-shadow duration-220 hover:shadow-[0_4px_20px_-4px_rgba(23,23,23,0.12)]">
      {/* Image zone */}
      <Link
        href={`/products/${product.id}`}
        className="block relative bg-[#F9F6F1] overflow-hidden"
        style={{ aspectRatio: '4/3' }}
        aria-label={product.title}
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain mix-blend-multiply p-4 transition-transform duration-320 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#E67661] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
            {product.badge}
          </span>
        )}

        {/* Discount pill */}
        {discountPct > 0 && (
          <span className="absolute top-3 right-3 bg-white border border-[#E3E1DD] text-[#2F7D5A] text-[10px] font-bold px-2 py-0.5 rounded-sm">
            {discountPct}% OFF
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        
        {/* Top Content */}
        <div className="flex flex-col gap-2">
          {/* Category */}
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">
            {product.category}
          </p>

          {/* Title */}
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-semibold text-[#171717] line-clamp-2 leading-snug hover:text-[#E67661] transition-colors"
          >
            {product.title}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5" aria-label={`Rating: ${product.rating} out of 5`}>
            <div className="flex items-center gap-0.5 text-[#C48A11]">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < ratingFull
                      ? 'fill-[#C48A11] text-[#C48A11]'
                      : 'fill-transparent text-[#E3E1DD]'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#6B7280]">
              ({(product.reviewCount || 0).toLocaleString()})
            </span>
          </div>

          {/* AI reason chip */}
          {showAiReason && aiReason && (
            <div className="chip-ai text-[10px] mt-1">
              <Sparkles className="w-3 h-3" />
              {aiReason}
            </div>
          )}
        </div>

        {/* Bottom Content (Pricing & CTA) pushed to bottom */}
        <div className="flex flex-col gap-3 mt-auto pt-4">
          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#171717] tracking-tight">
              ₹{Math.floor(product.price).toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#6B7280] line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Stock signal */}
          {isAvailable && product.stock <= 5 && (
            <p className="text-[11px] font-medium text-[#A66A00] -mt-2">
              Only {product.stock} left in stock
            </p>
          )}
          {!isAvailable && (
            <p className="text-[11px] text-[#C2413A] flex items-center gap-1 -mt-2">
              <AlertCircle className="w-3 h-3" /> Sold out
            </p>
          )}

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || isAdded}
            aria-label={isAdded ? 'Added to bag' : `Add ${product.title} to bag`}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-140 shrink-0 ${
              !isAvailable
                ? 'bg-[#E3E1DD] text-[#6B7280] cursor-not-allowed'
                : isAdded
                ? 'bg-[#2F7D5A] text-white'
                : 'bg-[#171717] hover:bg-[#E67661] text-white active:scale-[0.98] cursor-pointer'
            }`}
          >
            {!isAvailable ? (
              'Unavailable'
            ) : isAdded ? (
              <><Check className="w-4 h-4" /> Added to Bag</>
            ) : (
              <><ShoppingBag className="w-4 h-4" /> Add to Bag</>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
