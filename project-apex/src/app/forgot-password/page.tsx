'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, KeyRound, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          redirectTo: `${window.location.origin}/reset-password`,
        }),
      });

      // OWASP: Always return a generic success message regardless of account existence
      setSubmitted(true);
    } catch (err: any) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#eaeded] py-10 px-4 flex flex-col items-center justify-center font-sans">
      <div className="mb-6 text-center">
        <Link href="/" className="text-3xl font-black tracking-tight text-[#131921]">
          apex<span className="text-[#f08804]">.</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white p-7 sm:p-8 rounded-lg border border-gray-300 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Password assistance
        </h1>

        {submitted ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Check your email</span>
              </div>
              <p className="leading-relaxed text-emerald-800">
                If an account matches <strong>{email}</strong>, we have sent password reset instructions. For security, the link will expire in 1 hour.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm"
              >
                <span>Return to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-600 leading-relaxed mb-5">
              Enter the email address associated with your Project Apex account to receive password reset instructions.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-900 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm transition-all border border-[#fcd34d] flex items-center justify-center gap-2 ${
                  loading ? 'opacity-70 cursor-wait' : 'cursor-pointer active:scale-[0.99]'
                }`}
              >
                {loading ? (
                  <span>Sending instructions...</span>
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </form>

            <div className="border-t border-gray-200 mt-6 pt-4 text-center">
              <Link href="/login" className="text-xs text-[#007185] hover:underline font-medium">
                Remember your password? Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
