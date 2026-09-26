import React from 'react';
import Link from 'next/link';
import { Star, ChevronRight, Check } from 'lucide-react';
import { Product } from '@/types/product';

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap pb-1">
        <Link href="/" className="hover:text-[#007185] hover:underline">Home</Link>
        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
        <Link href={`/#${product.category.toLowerCase()}`} className="hover:text-[#007185] hover:underline">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
        <span className="text-gray-700 truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Brand & Badge */}
      <div className="space-y-1">
        {product.brand && (
          <Link href="#brand" className="text-xs font-semibold text-[#007185] hover:underline">
            Visit the {product.brand} Store
          </Link>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
          {product.title}
        </h1>
      </div>

      {/* Ratings & Reviews */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-[#ffa41c]">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating) 
                    ? 'fill-[#ffa41c] text-[#ffa41c]' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-700">{product.rating}</span>
        </div>
        <span className="text-gray-300">|</span>
        <a href="#reviews" className="text-xs text-[#007185] hover:underline hover:text-[#c7511f]">
          {product.reviewCount.toLocaleString()} ratings
        </a>
        {product.badge && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-[11px] font-bold bg-[#232f3e] text-white px-2 py-0.5 rounded shadow-xs">
              {product.badge}
            </span>
          </>
        )}
      </div>

      {/* Price Section */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          {discountPercent > 0 && (
            <span className="text-red-700 font-medium text-2xl sm:text-3xl">
              -{discountPercent}%
            </span>
          )}
          <div className="flex items-start text-gray-900">
            <span className="text-sm font-semibold mt-1">₹</span>
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {Math.floor(product.price)}
            </span>
            <span className="text-sm font-semibold mt-1">
              {(product.price % 1).toFixed(2).substring(2)}
            </span>
          </div>
        </div>

        {product.originalPrice && (
          <p className="text-xs text-gray-500">
            Typical price: <span className="line-through">₹{product.originalPrice.toFixed(2)}</span>
          </p>
        )}

        {product.isPrime && (
          <div className="flex items-center gap-1.5 pt-1">
            <span className="font-extrabold italic text-[#00a8e1] text-sm">prime</span>
            <span className="text-xs text-gray-600">One-Day Delivery & Free Returns</span>
          </div>
        )}
      </div>

      {/* About this item (Features) */}
      {product.features && product.features.length > 0 && (
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            About this item
          </h2>
          <ul className="space-y-1.5 text-xs text-gray-700 list-disc list-outside pl-4">
            {product.features.map((feature, idx) => (
              <li key={idx} className="leading-relaxed">{feature}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Specifications Table */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
            Product Specifications
          </h2>
          <div className="grid grid-cols-2 gap-y-2 text-xs border-y border-gray-100 py-3">
            {Object.entries(product.specs).map(([key, value]) => (
              <React.Fragment key={key}>
                <span className="font-semibold text-gray-600">{key}</span>
                <span className="text-gray-900">{value}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
