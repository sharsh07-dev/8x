'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export function StarRatingInput({ value, onChange, disabled = false }: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const labels: Record<number, string> = {
    1: '1 star - Hate it',
    2: "2 stars - Didn't like it",
    3: '3 stars - It was okay',
    4: '4 stars - Liked it',
    5: '5 stars - Loved it',
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Rating selector">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star`}
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHoverValue(star)}
            onMouseLeave={() => !disabled && setHoverValue(null)}
            className="p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-[#f08804] rounded transition-transform hover:scale-110 disabled:cursor-not-allowed cursor-pointer"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= displayValue
                  ? 'text-[#f08804] fill-[#f08804]'
                  : 'text-gray-300 hover:text-amber-200'
              }`}
            />
          </button>
        ))}
        {displayValue > 0 && (
          <span className="ml-2 text-xs font-semibold text-gray-700 select-none">
            {labels[displayValue]}
          </span>
        )}
      </div>
    </div>
  );
}
