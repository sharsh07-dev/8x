'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { 
  Star, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';

interface AuthoredReview {
  id: string;
  productId: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  status: string;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  productTitle: string;
  productImage: string;
  productCategory: string;
}

export default function AccountReviewsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [reviews, setReviews] = useState<AuthoredReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?callbackUrl=/account/reviews');
    }
  }, [session, isPending, router]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/account/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadReviews();
    }
  }, [session]);

  const startEdit = (review: AuthoredReview) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditTitle(review.title);
    setEditBody(review.body);
    setActionError(null);
  };

  const handleUpdate = async (reviewId: string) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: editRating,
          title: editTitle,
          body: editBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update review');

      setActionSuccess('Your review was updated successfully.');
      setEditingReviewId(null);
      loadReviews();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete review');

      setActionSuccess('Your review was deleted.');
      loadReviews();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08804]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaeded] py-8 px-4 sm:px-6 lg:px-8 font-sans text-xs">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 text-xs text-[#007185] hover:underline mb-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Your Account
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-[#f08804]" />
              Your Customer Reviews
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Manage your ratings, written reviews, and helpful feedback
            </p>
          </div>
        </div>

        {actionError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-10 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => {
              const isEditing = editingReviewId === review.id;
              return (
                <div
                  key={review.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs space-y-4"
                >
                  {/* Product Header */}
                  <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded border border-gray-200 overflow-hidden shrink-0">
                        <img
                          src={review.productImage}
                          alt={review.productTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm hover:text-[#007185]">
                          <Link href={`/products/${review.productId}`}>
                            {review.productTitle}
                          </Link>
                        </h3>
                        <span className="text-[11px] text-gray-500">{review.productCategory}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${review.productId}#reviews`}
                        className="p-1.5 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100"
                        title="View on product page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(review)}
                          className="p-1.5 text-gray-500 hover:text-[#007185] rounded hover:bg-gray-100 cursor-pointer"
                          title="Edit review"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-1.5 text-gray-500 hover:text-red-700 rounded hover:bg-gray-100 cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    /* In-place edit form */
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div>
                        <label className="block font-bold text-gray-900 mb-1">
                          Star rating (1-5)
                        </label>
                        <select
                          value={editRating}
                          onChange={(e) => setEditRating(Number(e.target.value))}
                          className="border border-gray-300 rounded p-1.5 bg-white text-gray-900"
                        >
                          {[5, 4, 3, 2, 1].map((s) => (
                            <option key={s} value={s}>
                              {s} {s === 1 ? 'star' : 'stars'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-900 mb-1">
                          Review Headline
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={120}
                          className="w-full border border-gray-300 rounded p-2 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-900 mb-1">
                          Review Body
                        </label>
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          maxLength={5000}
                          rows={4}
                          className="w-full border border-gray-300 rounded p-2 bg-white resize-y"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="px-3 py-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 cursor-pointer font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdate(review.id)}
                          className="px-4 py-1.5 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold rounded shadow-xs border border-[#fcd34d] cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display review details */
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-[#f08804] fill-[#f08804]'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <h4 className="font-bold text-gray-900 text-xs">{review.title}</h4>
                      </div>

                      {review.verifiedPurchase && (
                        <div className="flex items-center gap-1 text-[11px] text-[#c45500] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified Purchase</span>
                        </div>
                      )}

                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                        {review.body}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-gray-500 text-[11px]">
                        <span>
                          Written on {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>

                        {review.helpfulCount > 0 && (
                          <span className="flex items-center gap-1 text-gray-600 font-medium">
                            <ThumbsUp className="w-3 h-3 text-[#f08804]" />
                            {review.helpfulCount} {review.helpfulCount === 1 ? 'person' : 'people'} found this helpful
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center space-y-4">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="font-bold text-base text-gray-900">
              You haven't written any customer reviews yet
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Once you review products you've purchased on Project Apex, they will appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold text-xs rounded-full border border-[#fcd34d] shadow-xs"
              >
                Review Your Past Orders &rarr;
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
