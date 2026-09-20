'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const { 
    items, 
    isDrawerOpen, 
    setIsDrawerOpen, 
    removeFromCart, 
    updateQuantity, 
    getSubtotal, 
    getTotalItems 
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const freeShippingThreshold = 35;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-out transform select-none ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-[#131921] text-white px-5 py-4 flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#febd69]" />
            <h2 className="font-bold text-base tracking-tight">
              Your Cart <span className="text-gray-400 font-normal text-xs">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
            </h2>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-[#f0f2f2] px-5 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 className={`w-4 h-4 ${isFreeShipping ? 'text-emerald-600' : 'text-[#f08804]'}`} />
            <span className="text-xs text-gray-800">
              {isFreeShipping ? (
                <span className="font-bold text-emerald-800">You qualify for FREE Delivery!</span>
              ) : (
                <span>Add <strong className="text-red-700">${amountToFreeShipping.toFixed(2)}</strong> more for FREE shipping</span>
              )}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                isFreeShipping ? 'bg-emerald-600' : 'bg-[#f08804]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Your Cart is empty</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Explore our top deals and tech essentials to fill it up.
              </p>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="mt-5 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs py-2.5 px-6 rounded-full shadow-sm cursor-pointer"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="pt-4 first:pt-0 flex gap-3">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-50 rounded border border-gray-200 shrink-0 p-1 flex items-center justify-center">
                  <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-contain mix-blend-multiply" 
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-[#007185] cursor-pointer">
                      {product.title}
                    </h4>
                    <p className="text-xs font-bold text-gray-900 mt-1">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.isPrime && (
                      <span className="font-extrabold italic text-[#00a8e1] text-[10px] block">
                        prime
                      </span>
                    )}
                  </div>

                  {/* Quantity and Delete Bar */}
                  <div className="flex items-center justify-between mt-2 pt-1">
                    <div className="flex items-center border border-gray-300 rounded-md bg-white">
                      <button 
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-800">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button 
                      onClick={() => removeFromCart(product.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-600">Subtotal ({totalItems} items):</span>
              <span className="text-lg font-bold text-gray-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-3 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold text-xs rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <span>Proceed to checkout ({totalItems} items)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/cart"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-800 font-semibold text-xs rounded-full border border-gray-300 transition-colors text-center cursor-pointer"
              >
                Go to Shopping Cart
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure 256-bit encrypted checkout</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
