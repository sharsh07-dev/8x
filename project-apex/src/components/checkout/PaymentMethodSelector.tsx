'use client';

import React from 'react';
import { CreditCard, Banknote, Award, AlertTriangle, CheckCircle2, QrCode, Smartphone } from 'lucide-react';

export type PaymentProvider = 'RAZORPAY' | 'RAZORPAY_UPI' | 'SIMULATED_CARD' | 'CASH_ON_DELIVERY' | 'APEX_POINTS';

interface PaymentMethodSelectorProps {
  selectedProvider: PaymentProvider;
  onSelectProvider: (provider: PaymentProvider) => void;
  cardName: string;
  setCardName: (name: string) => void;
  cardNumber: string;
  setCardNumber: (num: string) => void;
  expiry: string;
  setExpiry: (exp: string) => void;
}

export function PaymentMethodSelector({
  selectedProvider,
  onSelectProvider,
  cardName,
  setCardName,
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
}: PaymentMethodSelectorProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold">3</span>
          Select a payment method
        </h2>
      </div>

      {/* Clear sandbox simulation banner */}
      <div className="mb-4 bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Payment Security:</span> Razorpay Test Mode and verified sandbox adapters are enabled. No live charges will be incurred.
        </div>
      </div>

      <div className="space-y-3">
        {/* Option 0A: Razorpay UPI */}
        <div
          onClick={() => onSelectProvider('RAZORPAY_UPI')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedProvider === 'RAZORPAY_UPI'
              ? 'border-emerald-600 bg-emerald-50/20 ring-2 ring-emerald-600/20'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment_method"
                checked={selectedProvider === 'RAZORPAY_UPI'}
                onChange={() => onSelectProvider('RAZORPAY_UPI')}
                className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-gray-900">UPI / QR Code (Google Pay, PhonePe, Paytm)</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded flex items-center gap-1">
              <QrCode className="w-3 h-3 text-emerald-600" /> Instant UPI
            </span>
          </div>

          {selectedProvider === 'RAZORPAY_UPI' && (
            <div className="mt-3 pt-3 border-t border-emerald-100 pl-7 text-xs text-gray-600 space-y-1.5">
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">UPI APPS &amp; QR</span>
                Google Pay, PhonePe, Paytm, BHIM, Cred &amp; all major UPI apps supported.
              </p>
              <p className="text-[11px] text-gray-500">
                You will be presented with an instant QR code or UPI ID prompt via Razorpay Test Gateway to complete approval.
              </p>
            </div>
          )}
        </div>

        {/* Option 0B: Razorpay Cards & Netbanking */}
        <div
          onClick={() => onSelectProvider('RAZORPAY')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedProvider === 'RAZORPAY'
              ? 'border-[#007185] bg-blue-50/20 ring-2 ring-[#007185]/20'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment_method"
                checked={selectedProvider === 'RAZORPAY'}
                onChange={() => onSelectProvider('RAZORPAY')}
                className="text-[#007185] focus:ring-[#007185] h-4 w-4"
              />
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-sm text-gray-900">Cards, Netbanking &amp; Wallets (Razorpay)</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
              Razorpay Gateway
            </span>
          </div>

          {selectedProvider === 'RAZORPAY' && (
            <div className="mt-3 pt-3 border-t border-blue-100 pl-7 text-xs text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">
                Supports Visa, MasterCard, RuPay, Maestro, 50+ Netbanking banks, and digital wallets.
              </p>
              <p className="text-[11px] text-gray-500">
                Secured by Razorpay 256-bit encryption.
              </p>
            </div>
          )}
        </div>
        {/* Option 1: Simulated Card */}
        <div
          onClick={() => onSelectProvider('SIMULATED_CARD')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedProvider === 'SIMULATED_CARD'
              ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment_method"
                checked={selectedProvider === 'SIMULATED_CARD'}
                onChange={() => onSelectProvider('SIMULATED_CARD')}
                className="text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-700" />
                <span className="font-bold text-sm text-gray-900">Credit or Debit Card</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
              Simulated Sandbox Card
            </span>
          </div>

          {selectedProvider === 'SIMULATED_CARD' && (
            <div className="mt-4 pt-3 border-t border-amber-200/50 pl-7 space-y-3 text-xs" onClick={(e) => e.stopPropagation()}>
              <p className="text-gray-500 font-medium">Use the test details below or enter sample name:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 font-bold mb-1">Name on card</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Alex Morgan (Test Customer)"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Card number (Test Visa)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="•••• •••• •••• 4242"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Expiration date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-400">Card verification values (CVV) are not stored or captured.</p>
            </div>
          )}
        </div>

        {/* Option 2: Cash on Delivery */}
        <div
          onClick={() => onSelectProvider('CASH_ON_DELIVERY')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedProvider === 'CASH_ON_DELIVERY'
              ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment_method"
                checked={selectedProvider === 'CASH_ON_DELIVERY'}
                onChange={() => onSelectProvider('CASH_ON_DELIVERY')}
                className="text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-gray-700" />
                <span className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</span>
              </div>
            </div>
            <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
              Pay upon receipt
            </span>
          </div>
          {selectedProvider === 'CASH_ON_DELIVERY' && (
            <p className="mt-2 text-xs text-gray-600 pl-7">
              Pay with cash or contactless card when the delivery partner arrives at your delivery location.
            </p>
          )}
        </div>

        {/* Option 3: Apex Points */}
        <div
          onClick={() => onSelectProvider('APEX_POINTS')}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${
            selectedProvider === 'APEX_POINTS'
              ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment_method"
                checked={selectedProvider === 'APEX_POINTS'}
                onChange={() => onSelectProvider('APEX_POINTS')}
                className="text-amber-600 focus:ring-amber-500 h-4 w-4"
              />
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-sm text-gray-900">Apex Store Rewards Points</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Balance: 5,420 pts
            </span>
          </div>
          {selectedProvider === 'APEX_POINTS' && (
            <p className="mt-2 text-xs text-gray-600 pl-7">
              Redeem reward points from your Apex account to cover this purchase in full.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
