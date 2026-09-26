'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Tag } from 'lucide-react';
import { Address } from './AddressSelector';
import { DeliveryOption } from '@/lib/checkout/pricing';
import { PaymentProvider } from './PaymentMethodSelector';

interface OrderItemPreview {
  productId: string;
  productTitle: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface OrderReviewProps {
  items: OrderItemPreview[];
  address: Address | null;
  deliveryOption: DeliveryOption;
  paymentProvider: PaymentProvider;
  promoCode: string;
  setPromoCode: (code: string) => void;
  onApplyPromo: () => void;
  appliedPromo?: string;
  applyingPromo?: boolean;
}

export function OrderReview({
  items,
  address,
  deliveryOption,
  paymentProvider,
  promoCode,
  setPromoCode,
  onApplyPromo,
  appliedPromo,
  applyingPromo,
}: OrderReviewProps) {
  const getPaymentName = () => {
    switch (paymentProvider) {
      case 'SIMULATED_CARD':
        return 'Test Card ending in 4242 (Sandbox)';
      case 'CASH_ON_DELIVERY':
        return 'Cash on Delivery (COD)';
      case 'APEX_POINTS':
        return 'Apex Rewards Points';
      default:
        return 'Simulated Payment';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold">4</span>
          Review items and delivery
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          {items.reduce((acc, i) => acc + i.quantity, 0)} {items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Delivery Summary Banner */}
      {address && (
        <div className="mb-5 bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <span className="font-bold text-slate-900 block mb-0.5">Shipping to:</span>
            <p className="text-gray-600">
              {address.fullName}, {address.street}, {address.city}, {address.state} {address.zipCode}
            </p>
          </div>
          <div>
            <span className="font-bold text-slate-900 block mb-0.5">Delivery promise & method:</span>
            <p className="text-emerald-700 font-semibold">{deliveryOption.name} — {deliveryOption.estimatedDelivery}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">Payment: {getPaymentName()}</p>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
        {items.map((item) => (
          <div key={item.productId} className="p-4 flex gap-4 items-center">
            <div className="w-16 h-16 relative bg-gray-50 rounded border border-gray-200 overflow-hidden shrink-0">
              <Image
                src={item.productImage}
                alt={item.productTitle}
                fill
                className="object-contain p-1"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate" title={item.productTitle}>
                {item.productTitle}
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span>Qty: <strong className="text-gray-800">{item.quantity}</strong></span>
                <span>Unit: <strong className="text-gray-800">₹{item.unitPrice.toFixed(2)}</strong></span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-bold text-gray-900">
                ₹{item.lineTotal.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Input */}
      <div className="mt-5 pt-4 border-t border-gray-100">
        <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-amber-600" /> Have a gift card, voucher, or promo code?
        </label>
        <div className="flex gap-2 max-w-sm">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="e.g. APEX10 or WELCOME15"
            className="border border-gray-300 rounded px-3 py-1.5 text-xs flex-1 uppercase focus:ring-1 focus:ring-amber-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onApplyPromo}
            disabled={applyingPromo || !promoCode.trim()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold px-3 py-1.5 rounded transition disabled:opacity-50"
          >
            {applyingPromo ? 'Applying...' : 'Apply'}
          </button>
        </div>
        {appliedPromo && (
          <p className="mt-2 text-xs font-medium text-emerald-700">
            ✓ Applied discount: {appliedPromo}
          </p>
        )}
      </div>
    </div>
  );
}
