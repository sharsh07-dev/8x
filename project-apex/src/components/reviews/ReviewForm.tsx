'use client';

import React, { useState } from 'react';
import { StarRatingInput } from './StarRatingInput';
import { useSession } from '@/lib/auth-client';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ReviewFormProps {
  productId: string;
  productTitle: string;
  onReviewSubmitted: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  productId,
  productTitle,
  onReviewSubmitted,
  onCancel,
}: ReviewFormProps) {
  const { data: session, isPending } = useSession();
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 animate-pulse text-center">
        <p className="text-xs text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="p-6 bg-amber-50/50 rounded-lg border border-amber-200 space-y-3">
        <h3 className="text-sm font-bold text-gray-900">Sign in to write a review</h3>
        <p className="text-xs text-gray-600">
          Share your experience with other shoppers. You must be signed in to submit a rating or feedback.
        </p>
        <Link
          href={`/login?callbackUrl=/products/${productId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold text-xs rounded-full border border-[#fcd34d] shadow-xs"
        >
          <span>Sign In to Review</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a review headline');
      return;
    }

    if (title.trim().length > 120) {
      setError('Headline must be 120 characters or fewer');
      return;
    }

    if (!body.trim()) {
      setError('Please enter your written review');
      return;
    }

    if (body.trim().length > 5000) {
      setError('Review text must be 5000 characters or fewer');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          body: body.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccessMsg('Thank you! Your customer review was published successfully.');
      setTitle('');
      setBody('');
      setRating(5);
      setTimeout(() => {
        onReviewSubmitted();
      }, 1200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs space-y-4 font-sans text-xs">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-base font-bold text-gray-900">Create Review</h3>
        <p className="text-xs text-gray-500 truncate">{productTitle}</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-start gap-2 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Overall Rating */}
        <div>
          <label className="block font-bold text-gray-900 mb-1.5">
            Overall rating
          </label>
          <StarRatingInput
            value={rating}
            onChange={setRating}
            disabled={isSubmitting}
          />
        </div>

        {/* Headline */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-gray-900">
              Add a headline
            </label>
            <span className="text-[10px] text-gray-400">{title.length}/120</span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            disabled={isSubmitting}
            placeholder="What's most important to know?"
            className="w-full border border-gray-300 rounded p-2.5 text-xs text-gray-900 focus:ring-1 focus:ring-[#f08804] outline-none"
          />
        </div>

        {/* Written Review */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-bold text-gray-900">
              Add a written review
            </label>
            <span className="text-[10px] text-gray-400">{body.length}/5000</span>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            rows={5}
            disabled={isSubmitting}
            placeholder="What did you like or dislike? What did you use this product for?"
            className="w-full border border-gray-300 rounded p-2.5 text-xs text-gray-900 focus:ring-1 focus:ring-[#f08804] outline-none resize-y"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold rounded-full shadow-xs border border-[#fcd34d] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
