'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RatingSummary } from './RatingSummary';
import { ReviewCard, FormattedReview } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import { ProductRatingSummary } from '@/lib/reviews/eligibility';
import { useSession } from '@/lib/auth-client';
import { MessageSquarePlus, ChevronDown, RefreshCw, Filter } from 'lucide-react';
import Link from 'next/link';

interface ReviewSectionProps {
  productId: string;
  productTitle: string;
}

export function ReviewSection({ productId, productTitle }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<ProductRatingSummary>({
    averageRating: 0,
    totalReviews: 0,
    hasReviews: false,
    distribution: [5, 4, 3, 2, 1].map((s) => ({ star: s, count: 0, percentage: 0 })),
  });
  const [reviews, setReviews] = useState<FormattedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & sorting state
  const [sort, setSort] = useState('relevance');
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showWriteForm, setShowWriteForm] = useState(false);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Failed to load review summary:', err);
    }
  }, [productId]);

  // Fetch reviews list
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '8');
      if (selectedStar) params.set('star', String(selectedStar));
      if (verifiedOnly) params.set('verifiedOnly', 'true');

      const res = await fetch(`/api/products/${productId}/reviews?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, sort, page, selectedStar, verifiedOnly]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReviewSubmitted = () => {
    setShowWriteForm(false);
    fetchSummary();
    fetchReviews();
  };

  return (
    <section className="border-t border-gray-200 pt-8 mt-12 font-sans" id="reviews">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (4 cols): Rating Summary & Write Review trigger */}
        <div className="lg:col-span-4 space-y-6">
          <RatingSummary
            summary={summary}
            selectedStar={selectedStar}
            onSelectStar={(star) => {
              setSelectedStar(star);
              setPage(1);
            }}
          />

          {/* Review this product call to action */}
          <div className="border-t border-gray-200 pt-6 space-y-3">
            <h3 className="font-bold text-sm text-gray-900">Review this product</h3>
            <p className="text-xs text-gray-600">
              Share your thoughts with other customers
            </p>

            {!showWriteForm && (
              <button
                type="button"
                onClick={() => setShowWriteForm(true)}
                className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-900 shadow-xs transition text-center cursor-pointer"
              >
                Write a customer review
              </button>
            )}
          </div>
        </div>

        {/* Right Column (8 cols): Review form or Reviews List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Review Form Expansion */}
          {showWriteForm && (
            <div className="mb-6 animate-fadeIn">
              <ReviewForm
                productId={productId}
                productTitle={productTitle}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowWriteForm(false)}
              />
            </div>
          )}

          {/* Top Controls: Filter bar and Sort select */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="font-bold text-gray-900">
                {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
              </span>

              {/* Verified Only Filter checkbox */}
              <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => {
                    setVerifiedOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-gray-300 text-[#f08804] focus:ring-[#f08804]"
                />
                <span>Verified purchases only</span>
              </label>

              {selectedStar && (
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-semibold">
                  Filtered: {selectedStar} Stars
                </span>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="border border-gray-300 rounded p-1.5 bg-white text-gray-900 font-medium text-xs outline-none focus:border-gray-500 cursor-pointer"
              >
                <option value="relevance">Top reviews (Most relevant)</option>
                <option value="recent">Most recent</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-lg animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-12 bg-gray-100 rounded w-full" />
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-2">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={session?.user?.id}
                />
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-6 flex items-center justify-between text-xs text-gray-600">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 font-medium cursor-pointer"
                  >
                    &larr; Previous Page
                  </button>
                  <span>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 font-medium cursor-pointer"
                  >
                    Next Page &rarr;
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <p className="font-semibold text-gray-800 text-sm">
                No customer reviews match the selected filters.
              </p>
              <p className="text-xs text-gray-500">
                Try selecting all star ratings or clearing the verified-purchase filter.
              </p>
              {(selectedStar !== null || verifiedOnly) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStar(null);
                    setVerifiedOnly(false);
                    setPage(1);
                  }}
                  className="text-xs text-[#007185] hover:underline font-semibold pt-1"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
