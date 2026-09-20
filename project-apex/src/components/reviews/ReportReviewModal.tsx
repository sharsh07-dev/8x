'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ReportReviewModalProps {
  isOpen: boolean;
  reviewId: string;
  onClose: () => void;
}

export function ReportReviewModal({ isOpen, reviewId, onClose }: ReportReviewModalProps) {
  const [reason, setReason] = useState('Spam or promotional content');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-300 relative space-y-4 font-sans text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold">Report this customer review</h3>
        </div>

        {isSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="font-bold text-sm text-gray-900">Report submitted</p>
            <p className="text-gray-500">
              Thank you for keeping Project Apex safe and helpful. Our moderation team will investigate.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Why are you reporting this review?
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-xs bg-white text-gray-800 focus:ring-1 focus:ring-[#f08804] outline-none"
              >
                <option value="Spam or promotional content">Spam or promotional content</option>
                <option value="Inappropriate language or harassment">Inappropriate language or harassment</option>
                <option value="Fake review or conflict of interest">Fake review or conflict of interest</option>
                <option value="Private personal information">Private personal information</option>
                <option value="Off-topic or irrelevant">Off-topic or irrelevant</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Help us understand the issue..."
                rows={3}
                className="w-full border border-gray-300 rounded p-2 text-xs text-gray-800 focus:ring-1 focus:ring-[#f08804] outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold rounded shadow-xs border border-[#fcd34d] disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
