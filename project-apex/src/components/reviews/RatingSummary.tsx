'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { ProductRatingSummary } from '@/lib/reviews/eligibility';

interface RatingSummaryProps {
  summary: ProductRatingSummary;
  selectedStar: number | null;
  onSelectStar: (star: number | null) => void;
}

export function RatingSummary({ summary, selectedStar, onSelectStar }: RatingSummaryProps) {
  const { averageRating, totalReviews, hasReviews, distribution } = summary;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Customer reviews</h2>

      {hasReviews ? (
        <div className="space-y-3">
          {/* Average Rating and Stars */}
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating)
                      ? 'text-[#f08804] fill-[#f08804]'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-gray-900">
              {averageRating.toFixed(1)} out of 5
            </span>
          </div>

          <p className="text-xs text-gray-500">
            {totalReviews.toLocaleString()} global {totalReviews === 1 ? 'rating' : 'ratings'}
          </p>

          {/* Breakdown Bars from 5 to 1 */}
          <div className="space-y-2 pt-2">
            {distribution.map(({ star, count, percentage }) => {
              const isSelected = selectedStar === star;
              return (
                <button
                  key={star}
                  onClick={() => onSelectStar(isSelected ? null : star)}
                  className={`w-full flex items-center gap-3 text-xs text-left group py-0.5 rounded px-1 -mx-1 hover:bg-gray-50 transition cursor-pointer ${
                    isSelected ? 'ring-2 ring-[#007185] bg-blue-50/50' : ''
                  }`}
                >
                  <span className="w-12 text-[#007185] group-hover:underline font-medium shrink-0">
                    {star} star
                  </span>
                  
                  {/* Progress track */}
                  <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden border border-gray-200">
                    <div
                      className="h-full bg-[#f08804] rounded transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-gray-600 group-hover:underline font-medium shrink-0">
                    {percentage}%
                  </span>
                </button>
              );
            })}
          </div>

          {selectedStar && (
            <div className="pt-2">
              <button
                onClick={() => onSelectStar(null)}
                className="text-xs text-[#007185] hover:underline font-semibold"
              >
                Clear {selectedStar}-star filter &times;
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center space-y-1">
          <p className="text-sm font-semibold text-gray-800">No ratings yet</p>
          <p className="text-xs text-gray-500">
            Be the first customer to review this item!
          </p>
        </div>
      )}
    </div>
  );
}
