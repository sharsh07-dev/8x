'use client';

import Link from 'next/link';
import { StylistProduct } from '@/lib/stylist/types';
import { ShoppingBag, Star } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

interface Props {
  product: StylistProduct;
}

export default function StylistProductCard({ product }: Props) {
  const addToCart = useCartStore((state) => state.addToCart);

  const discountPct = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const matchPct = Math.round(product.matchScore * 100);

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-[#E3E1DD] overflow-hidden hover:shadow-md transition-all duration-200 h-full">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="relative block bg-[#F9F6F1] overflow-hidden aspect-[3/4]">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-contain mix-blend-multiply p-3 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Match score badge */}
        <span className="absolute top-2 left-2 bg-[#E67661] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {matchPct}% Match
        </span>
        {discountPct > 0 && (
          <span className="absolute top-2 right-2 bg-white border text-[#2F7D5A] text-[10px] font-bold px-1.5 py-0.5 rounded">
            {discountPct}% OFF
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Title */}
        <Link href={`/products/${product.id}`} className="text-xs font-semibold text-[#171717] line-clamp-2 hover:text-[#E67661] transition-colors leading-snug">
          {product.title}
        </Link>

        {/* Explanation tags */}
        {product.explanation.length > 0 && (
          <p className="text-[10px] text-[#2F7D5A] leading-relaxed line-clamp-2">
            {product.explanation[0]}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-sm font-bold text-[#171717]">₹{Math.floor(product.price).toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-[#9CA3AF] line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Add to bag */}
        <button
          onClick={() => addToCart({
            id: product.id,
            title: product.title,
            price: product.price,
            compareAtPrice: product.originalPrice,
            image: product.image,
            images: [{ url: product.image }],
            rating: 4.0,
            reviewCount: 0,
            stock: product.stock,
            inStock: product.inStock,
            category: product.category,
          } as any, 1, false)}
          className="w-full py-2 rounded-lg text-xs font-semibold bg-[#171717] text-white hover:bg-[#E67661] transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Add to Bag
        </button>
      </div>
    </div>
  );
}
