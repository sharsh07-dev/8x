'use client';

import React from 'react';
import { Truck, Zap, ShieldCheck } from 'lucide-react';
import { DeliveryOption } from '@/lib/checkout/pricing';

interface DeliveryOptionsProps {
  options: DeliveryOption[];
  selectedOptionId: string;
  onSelectOption: (optionId: string) => void;
  subtotal: number;
}

export function DeliveryOptions({
  options,
  selectedOptionId,
  onSelectOption,
  subtotal,
}: DeliveryOptionsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold">2</span>
          Choose your delivery option
        </h2>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Apex Guaranteed Delivery
        </span>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const isFree = opt.price === 0 || (opt.id === 'FREE_STANDARD' && subtotal >= 35);
          const displayPrice = isFree ? 'FREE' : `$${opt.price.toFixed(2)}`;

          return (
            <label
              key={opt.id}
              className={`flex items-start justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="delivery_option"
                  checked={isSelected}
                  onChange={() => onSelectOption(opt.id)}
                  className="mt-1 text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{opt.name}</span>
                    {opt.id === 'ONE_DAY' && (
                      <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Fastest
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                    Estimated delivery: {opt.estimatedDelivery}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-sm font-bold ${isFree ? 'text-emerald-700' : 'text-gray-900'}`}>
                  {displayPrice}
                </span>
                <p className="text-[11px] text-gray-500">{opt.speed}</p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
