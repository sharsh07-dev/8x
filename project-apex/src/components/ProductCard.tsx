'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Check, ShoppingCart, AlertCircle } from 'lucide-react';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const isAvailable = product.inStock && product.stock > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAvailable) return;
    
    addToCart(product, 1, true);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg p-4 flex flex-col justify-between border border-gray-200 hover:shadow-xl transition-all duration-200 relative group">
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-2 left-2 z-10">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded shadow-sm ${
            product.badge.includes('Deal') 
              ? 'bg-[#cc0c39] text-white' 
              : product.badge.includes('Best')
              ? 'bg-[#e67a00] text-white'
              : 'bg-[#232f3e] text-white'
          }`}>
            {product.badge}
          </span>
        </div>
      )}

      <div>
        {/* Product Image Link */}
        <Link 
          href={`/products/${product.id}`}
          className="relative w-full h-48 sm:h-52 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center mb-3 block"
        >
          <img 
            src={product.image} 
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 p-2"
            loading="lazy"
          />
        </Link>

        {/* Category */}
        <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
          {product.category}
        </span>

        {/* Title Link */}
        <Link 
          href={`/products/${product.id}`}
          className="text-sm font-medium text-gray-900 line-clamp-2 mt-1 hover:text-[#007185] cursor-pointer transition-colors block leading-snug" 
          title={product.title}
        >
          {product.title}
        </Link>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center text-[#ffa41c]">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating) 
                    ? 'fill-[#ffa41c] text-[#ffa41c]' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
          <span className="text-xs text-[#007185] hover:underline cursor-pointer">
            {product.reviewCount.toLocaleString()}
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-2.5 flex items-baseline gap-2">
          {discountPercent > 0 && (
            <span className="text-red-700 font-normal text-sm">
              -{discountPercent}%
            </span>
          )}
          <div className="flex items-start text-gray-900">
            <span className="text-xs font-semibold mt-0.5">$</span>
            <span className="text-2xl font-bold tracking-tight">
              {Math.floor(product.price)}
            </span>
            <span className="text-xs font-semibold mt-0.5">
              {(product.price % 1).toFixed(2).substring(2)}
            </span>
          </div>

          {product.originalPrice && (
            <span className="text-xs text-gray-500 line-through">
              Typical: ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock & Delivery Info */}
        <div className="mt-1.5 space-y-0.5 text-xs">
          {isAvailable ? (
            <>
              {product.stock <= 5 && (
                <p className="text-red-700 font-semibold text-[11px]">
                  Only {product.stock} left in stock - order soon
                </p>
              )}
              {product.isPrime && (
                <div className="flex items-center gap-1">
                  <span className="font-extrabold italic text-[#00a8e1] text-xs">prime</span>
                  <span className="text-gray-600 font-normal text-[11px]">One-Day</span>
                </div>
              )}
              <p className="text-gray-600 text-[11px]">
                FREE delivery <span className="font-bold text-gray-900">Tomorrow</span>
              </p>
            </>
          ) : (
            <p className="text-red-700 font-medium text-xs flex items-center gap-1 pt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Currently unavailable
            </p>
          )}
        </div>
      </div>

      {/* Add to Cart CTA */}
      <div className="mt-4 pt-2 border-t border-gray-100">
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable || isAdded}
          className={`w-full py-2 px-3 rounded-full text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
            !isAvailable
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isAdded
              ? 'bg-emerald-600 text-white shadow-inner cursor-default'
              : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] active:scale-[0.98] cursor-pointer'
          }`}
        >
          {!isAvailable ? (
            <span>Out of Stock</span>
          ) : isAdded ? (
            <>
              <Check className="w-4 h-4" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
