'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, RotateCw } from 'lucide-react';
import { sendVerificationEmail } from '@/lib/auth-client';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0) return;
    setResending(true);
    setResendStatus(null);

    try {
      const res = await sendVerificationEmail({
        email,
        callbackURL: '/verify-email',
      });

      if (res.error) {
        setResendStatus('Unable to resend email right now. Please try again later.');
      } else {
        setResendStatus('A new verification email has been delivered to your inbox.');
        setCountdown(60); // 60 second rate-limiting cooldown
      }
    } catch {
      setResendStatus('A network error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-7 sm:p-8 rounded-lg border border-gray-300 shadow-sm text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#f08804]">
        <Mail className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Verify your email address
      </h1>

      <p className="text-xs text-gray-600 leading-relaxed mb-4">
        We sent a real verification link to{' '}
        <strong className="text-gray-900">{email || 'your email address'}</strong>.
        Please check your inbox and click the single-use link to activate your account.
      </p>

      {resendStatus && (
        <div className="mb-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resendStatus}</span>
        </div>
      )}

      {/* Resend Action with Rate-Limiting Throttling */}
      <div className="space-y-3 pt-2">
        {email && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || countdown > 0}
            className={`w-full py-2.5 px-4 rounded-full text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
              countdown > 0
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50 text-gray-800 border-gray-300 cursor-pointer'
            }`}
          >
            {resending ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sending verification link...</span>
              </>
            ) : countdown > 0 ? (
              <span>Resend available in {countdown}s</span>
            ) : (
              <span>Resend verification email</span>
            )}
          </button>
        )}

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm transition-all border border-[#fcd34d]"
        >
          <span>Return to Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="border-t border-gray-200 mt-6 pt-4 text-[11px] text-gray-500">
        Did not receive the email? Please check your spam or junk folder, or ensure the address entered is correct.
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
