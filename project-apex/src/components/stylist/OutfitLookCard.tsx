'use client';

import { useState } from 'react';
import { OutfitLook } from '@/lib/stylist/types';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface Props {
  look: OutfitLook;
}

export default function OutfitLookCard({ look }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#E3E1DD] rounded-2xl overflow-hidden bg-white">
      {/* Look header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#F9F6F1] to-[#FFF6F3] border-b border-[#E3E1DD]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#171717] font-mono uppercase tracking-wide text-sm">
              {look.name}
            </h3>
            <p className="text-xs text-[#6B7280] mt-0.5">{look.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#9CA3AF]">Complete look</p>
            <p className="text-lg font-bold text-[#171717]">₹{look.totalPrice.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Products horizontal scroll */}
      <div className="flex gap-3 p-4 overflow-x-auto hide-scrollbar">
        {look.products.map(({ product, role, matchScore, explanation }) => (
          <div key={product.id} className="shrink-0 w-36 flex flex-col gap-1">
            <Link href={`/products/${product.id}`} className="block bg-[#F9F6F1] rounded-xl overflow-hidden aspect-[3/4] relative group">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-contain mix-blend-multiply p-2 group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              <span className="absolute top-1.5 left-1.5 bg-[#E67661] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {Math.round(matchScore * 100)}%
              </span>
            </Link>
            <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wide">{role}</p>
            <Link href={`/products/${product.id}`} className="text-xs font-semibold text-[#171717] line-clamp-2 leading-tight hover:text-[#E67661]">
              {product.title}
            </Link>
            <p className="text-xs font-bold text-[#171717]">₹{product.price.toLocaleString()}</p>
            {explanation[0] && (
              <p className="text-[10px] text-[#2F7D5A] line-clamp-1">{explanation[0]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-[#E3E1DD] bg-[#FAFAF9]">
        <button className="flex-1 py-2.5 rounded-xl bg-[#171717] text-white text-sm font-semibold hover:bg-[#E67661] transition-colors flex items-center justify-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Add Entire Look
        </button>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-4 py-2.5 rounded-xl border border-[#E3E1DD] text-sm text-[#6B7280] hover:border-[#E67661] hover:text-[#E67661] transition-colors flex items-center gap-1"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Details
        </button>
      </div>

      {/* Expanded explanations */}
      {expanded && (
        <div className="px-5 py-4 border-t border-[#E3E1DD] bg-[#F9F6F1]">
          <h4 className="text-xs font-semibold text-[#4B4B4B] uppercase tracking-widest mb-3">Why this look works</h4>
          <div className="flex flex-col gap-2">
            {look.products.map(({ product, explanation }) => (
              <div key={product.id}>
                <p className="text-xs font-semibold text-[#171717]">{product.title.substring(0, 50)}...</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {explanation.map((e, i) => (
                    <span key={i} className="text-[10px] bg-white border border-[#E3E1DD] px-2 py-0.5 rounded-full text-[#4B4B4B]">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
