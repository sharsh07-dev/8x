'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { verifyEmail } from '@/lib/auth-client';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function VerifyEmailTokenPage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    async function executeVerification() {
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid or missing verification token.');
        return;
      }

      try {
        const res = await verifyEmail({
          query: { token },
        });

        if (res.error) {
          setStatus('error');
          setErrorMessage(
            res.error.message ||
            'This verification link is invalid or has already expired. Please request a new one.'
          );
        } else {
          setStatus('success');
          // Automatically redirect to account or login after 3 seconds
          setTimeout(() => {
            router.push('/login?verified=true');
          }, 2500);
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage('Verification failed due to a network issue. Please try again.');
      }
    }

    executeVerification();
  }, [token, router]);

  return (
    <div className="min-h-[85vh] bg-[#eaeded] py-10 px-4 flex flex-col items-center justify-center font-sans">
      <div className="mb-6 text-center">
        <Link href="/" className="text-3xl font-black tracking-tight text-[#131921]">
          apex<span className="text-[#f08804]">.</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-300 shadow-sm text-center">
        {status === 'loading' && (
          <div className="space-y-4 py-6">
            <div className="w-10 h-10 border-3 border-[#f08804] border-t-transparent rounded-full animate-spin mx-auto" />
            <h1 className="text-lg font-bold text-gray-900">
              Verifying your email address...
            </h1>
            <p className="text-xs text-gray-500">
              Please wait while our security service validates your token.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Email Verified Successfully!
            </h1>
            <p className="text-xs text-gray-600 leading-relaxed">
              Your Project Apex account is now verified and active. Redirecting you to sign in...
            </p>
            <div className="pt-2">
              <Link
                href="/login?verified=true"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm"
              >
                <span>Continue to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Verification Link Invalid or Expired
            </h1>
            <p className="text-xs text-red-700 leading-relaxed">
              {errorMessage}
            </p>
            <div className="pt-3 space-y-2">
              <Link
                href="/verify-email"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm"
              >
                Request a new verification email
              </Link>
              <Link
                href="/login"
                className="block text-xs text-[#007185] hover:underline pt-1"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
