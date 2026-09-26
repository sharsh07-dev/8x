'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Lock, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  ShoppingCart, 
  AlertCircle 
} from 'lucide-react';
import { Product } from '@/types/product';
import { useCartStore } from '@/store/useCartStore';

interface PurchaseSectionProps {
  product: Product;
}

export default function PurchaseSection({ product }: PurchaseSectionProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const isAvailable = product.inStock && product.stock > 0;
  const maxQty = Math.min(product.stock, 10);

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart(product, quantity, false);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1800);
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addToCart(product, quantity, false);
    router.push('/checkout');
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-xs space-y-4 text-xs select-none sticky top-24">
      {/* Price in Buy Box */}
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-bold text-gray-900">₹</span>
        <span className="text-2xl font-black text-gray-900">
          {(product.price * (isAvailable ? quantity : 1)).toFixed(2)}
        </span>
        {quantity > 1 && isAvailable && (
          <span className="text-[11px] text-gray-500 ml-1">
            (₹{product.price.toFixed(2)} each)
          </span>
        )}
      </div>

      {/* Delivery Promise */}
      <div className="space-y-1 text-gray-700">
        <p>
          FREE delivery <span className="font-bold text-gray-900">Tomorrow</span>. Order within <span className="text-emerald-700 font-semibold">4 hrs 28 mins</span>
        </p>
        <div className="flex items-center gap-1 text-[#007185] hover:underline cursor-pointer">
          <MapPin className="w-3.5 h-3.5" />
          <span>Deliver to Seattle 98101</span>
        </div>
      </div>

      {/* Stock Status Indicator */}
      <div>
        {isAvailable ? (
          product.stock <= 5 ? (
            <p className="text-red-700 font-bold text-sm">
              Only {product.stock} left in stock - order soon.
            </p>
          ) : (
            <p className="text-emerald-700 font-bold text-base">
              In Stock
            </p>
          )
        ) : (
          <div className="space-y-1">
            <p className="text-red-700 font-bold text-base flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Currently unavailable
            </p>
            <p className="text-gray-500 text-[11px]">
              We don't know when or if this item will be back in stock.
            </p>
          </div>
        )}
      </div>

      {/* Quantity Selector (Only if in stock) */}
      {isAvailable && (
        <div className="flex items-center gap-3">
          <label htmlFor="quantity-select" className="font-semibold text-gray-700">
            Quantity:
          </label>
          <select
            id="quantity-select"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-3 py-1 font-bold text-xs text-gray-900 outline-none cursor-pointer focus:ring-2 focus:ring-[#f08804]"
          >
            {Array.from({ length: maxQty }, (_, i) => i + 1).map((qty) => (
              <option key={qty} value={qty}>
                {qty}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-2.5 pt-1">
        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable || isAdded}
          className={`w-full py-2.5 px-4 rounded-full font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${
            !isAvailable
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isAdded
              ? 'bg-emerald-600 text-white shadow-inner cursor-default'
              : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] hover:shadow cursor-pointer active:scale-[0.98]'
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

        {/* Buy Now */}
        <button
          onClick={handleBuyNow}
          disabled={!isAvailable}
          className={`w-full py-2.5 px-4 rounded-full font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${
            !isAvailable
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#ffa41c] hover:bg-[#fa8900] text-[#0f1111] hover:shadow cursor-pointer active:scale-[0.98]'
          }`}
        >
          <span>Buy Now</span>
        </button>
      </div>

      {/* Trust & Dispatch details */}
      <div className="border-t border-gray-200 pt-3 space-y-1.5 text-[11px] text-gray-600">
        <div className="grid grid-cols-2">
          <span className="text-gray-500">Ships from</span>
          <span className="text-gray-900 font-medium">Apex</span>
        </div>
        <div className="grid grid-cols-2">
          <span className="text-gray-500">Sold by</span>
          <span className="text-[#007185] hover:underline cursor-pointer font-medium">
            {product.brand || 'Apex Official Store'}
          </span>
        </div>
        <div className="grid grid-cols-2">
          <span className="text-gray-500">Returns</span>
          <span className="text-[#007185] hover:underline cursor-pointer font-medium">
            30-day refund/replacement
          </span>
        </div>
        <div className="grid grid-cols-2">
          <span className="text-gray-500">Payment</span>
          <span className="text-[#007185] flex items-center gap-1 font-medium">
            <Lock className="w-3 h-3 text-emerald-600" />
            Secure transaction
          </span>
        </div>
      </div>
    </div>
  );
}
