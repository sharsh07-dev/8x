'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const FREE_SHIPPING_THRESHOLD = 999;

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    removeFromCart,
    updateQuantity,
    getSubtotal,
    getTotalItems,
  } = useCartStore();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const subtotal     = getSubtotal();
  const totalItems   = getTotalItems();
  const toFreeShip   = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progress     = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const isFreeShip   = toFreeShip === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[#171717]/40 backdrop-blur-[2px] z-50 transition-opacity duration-220 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Slide panel */}
      <div
        role="dialog"
        aria-label="Shopping bag"
        aria-modal="true"
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#F9F6F1] z-50 flex flex-col transition-transform duration-320 ease-out ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#E3E1DD] bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E67661]" />
            <h2 className="font-semibold text-base text-[#171717]">
              Your Bag{' '}
              <span className="text-[#6B7280] font-normal text-sm">
                ({totalItems} {totalItems === 1 ? 'item' : 'items'})
              </span>
            </h2>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close shopping bag"
            className="p-2 rounded-full hover:bg-[#E3E1DD] text-[#6B7280] hover:text-[#171717] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="px-6 py-3 bg-white border-b border-[#E3E1DD]">
          <p className="text-xs text-[#6B7280] mb-2">
            {isFreeShip ? (
              <span className="text-[#2F7D5A] font-semibold">✓ You qualify for free delivery!</span>
            ) : (
              <>Add <strong className="text-[#171717]">₹{toFreeShip.toFixed(0)}</strong> more for free delivery</>
            )}
          </p>
          <div className="h-1.5 bg-[#E3E1DD] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2F7D5A] rounded-full transition-all duration-320"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#E3E1DD] flex items-center justify-center mb-4">
                <ShoppingBag className="w-9 h-9 text-[#6B7280]" />
              </div>
              <h3 className="text-lg font-semibold text-[#171717]">
                Your bag is empty
              </h3>
              <p className="text-sm text-[#6B7280] mt-2 max-w-xs">
                Explore our collection and find something you'll love.
              </p>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="mt-6 btn-primary text-sm"
                style={{ borderRadius: '8px', padding: '10px 24px', minHeight: 'auto' }}
              >
                Start shopping
              </button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 bg-white rounded-xl p-3 border border-[#E3E1DD]">
                {/* Image */}
                <div className="w-20 h-20 bg-[#F9F6F1] rounded-lg flex-shrink-0 flex items-center justify-center p-1">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-[#171717] line-clamp-2 leading-snug">
                    {product.title}
                  </h4>
                  <p className="text-base font-semibold text-[#171717] mt-1">
                    ₹{product.price.toFixed(0)}
                  </p>

                  {/* Qty + Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-[#E3E1DD] rounded-lg overflow-hidden bg-[#F9F6F1]">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-1.5 text-[#6B7280] hover:text-[#171717] hover:bg-[#E3E1DD] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-semibold text-[#171717]">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-1.5 text-[#6B7280] hover:text-[#171717] hover:bg-[#E3E1DD] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      aria-label="Remove item"
                      className="p-1.5 text-[#6B7280] hover:text-[#C2413A] transition-colors rounded-lg hover:bg-[rgba(194,65,58,0.08)]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 bg-white border-t border-[#E3E1DD] space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[#6B7280]">Subtotal ({totalItems} items)</span>
              <span className="text-xl font-bold text-[#171717]">₹{subtotal.toFixed(0)}</span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsDrawerOpen(false)}
              className="btn-primary w-full text-center flex items-center justify-center gap-2"
              style={{ borderRadius: '12px', fontSize: '15px', minHeight: '52px' }}
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/cart"
              onClick={() => setIsDrawerOpen(false)}
              className="w-full py-3 rounded-xl border border-[#E3E1DD] text-sm font-semibold text-[#171717] hover:bg-[#F9F6F1] transition-colors text-center block"
            >
              View Full Cart
            </Link>

            <div className="flex items-center justify-center gap-2 text-xs text-[#6B7280]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D5A]" />
              Secure & encrypted checkout
            </div>
          </div>
        )}
      </div>
    </>
  );
}
