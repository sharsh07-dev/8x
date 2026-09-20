'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/auth-client';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Password reset token is missing. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setError('Passwords must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPassword: password,
          token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'This reset link has expired or has already been used. Please request a new one.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch {
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-7 sm:p-8 rounded-lg border border-gray-300 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Create new password
      </h1>
      <p className="text-xs text-gray-600 mb-5 leading-relaxed">
        We'll ask for this password whenever you sign in to Project Apex.
      </p>

      {success ? (
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Password Reset Successfully!</p>
              <p>Your password has been changed. Redirecting you to sign in...</p>
            </div>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-5 p-3.5 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-900 mb-1">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full px-3 py-2 pr-10 text-xs border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-gray-400" />
                Passwords must be at least 8 characters.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-900 mb-1">
                Re-enter new password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-3 py-2 pr-10 text-xs border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm transition-all border border-[#fcd34d] flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-wait' : 'cursor-pointer active:scale-[0.99]'
              }`}
            >
              {loading ? <span>Saving changes...</span> : <span>Save changes and sign in</span>}
            </button>
          </form>

          <div className="border-t border-gray-200 mt-6 pt-4 text-center">
            <Link href="/login" className="text-xs text-[#007185] hover:underline font-medium">
              Back to Sign In
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[85vh] bg-[#eaeded] py-10 px-4 flex flex-col items-center justify-center font-sans">
      <div className="mb-6 text-center">
        <Link href="/" className="text-3xl font-black tracking-tight text-[#131921]">
          apex<span className="text-[#f08804]">.</span>
        </Link>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-300 shadow-sm text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08804] mx-auto" />
        </div>
      }>
        <ResetPasswordFormContent />
      </Suspense>
    </div>
  );
}
