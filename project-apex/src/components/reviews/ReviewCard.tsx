'use client';

import React, { useState } from 'react';
import { Star, CheckCircle2, ThumbsUp, Flag, User as UserIcon } from 'lucide-react';
import { ReportReviewModal } from './ReportReviewModal';

export interface FormattedReview {
  id: string;
  productId: string;
  rating: number;
  title: string;
  body: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    image?: string | null;
  };
}

interface ReviewCardProps {
  review: FormattedReview;
  currentUserId?: string | null;
  onVoteSuccess?: (reviewId: string, newCount: number) => void;
}

export function ReviewCard({ review, currentUserId, onVoteSuccess }: ReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleHelpful = async () => {
    if (!currentUserId) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (currentUserId === review.reviewer.id) {
      setFeedbackMsg('You cannot vote on your own review');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    if (hasVoted) return;

    setIsVoting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/helpful`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setHelpfulCount(data.helpfulCount);
        setHasVoted(true);
        if (onVoteSuccess) {
          onVoteSuccess(review.id, data.helpfulCount);
        }
      } else {
        setFeedbackMsg(data.error || 'Failed to record vote');
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="border-b border-gray-200 py-5 space-y-2.5 font-sans">
      {/* Reviewer Profile Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
          {review.reviewer.image ? (
            <img src={review.reviewer.image} alt={review.reviewer.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-4 h-4" />
          )}
        </div>
        <span className="text-xs font-semibold text-gray-900">
          {review.reviewer.name}
        </span>
      </div>

      {/* Stars & Review Title */}
      <div className="flex items-center gap-2 flex-wrap">
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
        <h4 className="text-xs font-bold text-gray-900">
          {review.title}
        </h4>
      </div>

      {/* Date & Country */}
      <p className="text-[11px] text-gray-500">
        Reviewed in the United States on {formattedDate}
      </p>

      {/* Verified Purchase Badge */}
      {review.verifiedPurchase && (
        <div className="flex items-center gap-1 text-[11px] text-[#c45500] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#c45500]" />
          <span>Verified Purchase</span>
        </div>
      )}

      {/* Review Text */}
      <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line pt-1">
        {review.body}
      </p>

      {/* Helpful & Actions Bar */}
      <div className="pt-2 flex items-center gap-4 text-xs text-gray-500 select-none">
        {helpfulCount > 0 && (
          <span className="text-[11px]">
            {helpfulCount} {helpfulCount === 1 ? 'person' : 'people'} found this helpful
          </span>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleHelpful}
            disabled={isVoting || hasVoted}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium transition cursor-pointer ${
              hasVoted
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{hasVoted ? 'Helpful' : 'Helpful'}</span>
          </button>

          <span className="text-gray-300">|</span>

          <button
            onClick={() => setShowReportModal(true)}
            className="text-[11px] text-gray-500 hover:text-gray-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Flag className="w-3 h-3" />
            <span>Report</span>
          </button>
        </div>

        {feedbackMsg && (
          <span className="text-[11px] text-amber-700 font-medium">
            {feedbackMsg}
          </span>
        )}
      </div>

      <ReportReviewModal
        isOpen={showReportModal}
        reviewId={review.id}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
}
