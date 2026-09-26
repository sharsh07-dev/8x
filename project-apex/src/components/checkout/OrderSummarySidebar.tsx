'use client';

import React from 'react';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import { PricingCalculationResult } from '@/lib/checkout/pricing';

interface OrderSummarySidebarProps {
  pricing: PricingCalculationResult;
  isSubmitting: boolean;
  onPlaceOrder: () => void;
  canPlaceOrder: boolean;
  errorMessage?: string;
}

export function OrderSummarySidebar({
  pricing,
  isSubmitting,
  onPlaceOrder,
  canPlaceOrder,
  errorMessage,
}: OrderSummarySidebarProps) {
  const itemCount = pricing.items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-24">
      {/* Top Place Order Button */}
      <button
        type="button"
        disabled={!canPlaceOrder || isSubmitting}
        onClick={onPlaceOrder}
        className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3 px-4 rounded-lg text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
            Processing Order...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 text-slate-800" />
            Place your order
          </>
        )}
      </button>

      <p className="text-[11px] text-gray-500 text-center mt-2.5 leading-tight">
        By placing your order, you agree to Project Apex’s privacy notice and conditions of use.
      </p>

      {errorMessage && (
        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 font-medium">
          {errorMessage}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-gray-200">
        <h3 className="text-base font-bold text-gray-900 mb-3">Order Summary</h3>

        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Items ({itemCount}):</span>
            <span className="text-gray-900 font-medium">₹{pricing.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping &amp; handling:</span>
            <span className={pricing.shipping === 0 ? 'text-emerald-700 font-bold' : 'text-gray-900 font-medium'}>
              {pricing.shipping === 0 ? 'FREE' : `₹${pricing.shipping.toFixed(2)}`}
            </span>
          </div>

          {pricing.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Savings applied:</span>
              <span>-₹{pricing.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Estimated tax to be collected:</span>
            <span className="text-gray-900 font-medium">₹{pricing.tax.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-baseline">
          <span className="text-base font-bold text-gray-900">Order total:</span>
          <span className="text-xl font-extrabold text-amber-700">
            ₹{pricing.total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Safe &amp; Secure Checkout. Transactions are protected by end-to-end encryption.</span>
      </div>
    </div>
  );
}
