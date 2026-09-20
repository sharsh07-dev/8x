'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from '@/lib/auth-client';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/account';
  const isJustVerified = searchParams.get('verified') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  const { data: session, isPending } = useSession();

  // If already logged in, skip the login page entirely
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(callbackUrl);
    }
  }, [session, isPending, callbackUrl, router]);

  // After a successful sign-in, wait for useSession to confirm the user
  // then redirect — this avoids the race condition where the account page
  // redirects back because the session cookie isn't ready yet.
  useEffect(() => {
    if (signedIn && !isPending && session?.user) {
      router.replace(callbackUrl);
    }
  }, [signedIn, session, isPending, callbackUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
        callbackURL: callbackUrl,
      });

      if (res.error) {
        // OWASP best practice: generic credentials error to prevent user enumeration
        if (res.error.message?.toLowerCase().includes('verify your email') || res.error.status === 403) {
          setError('Please verify your email address before signing in. Check your inbox or request a new verification email.');
        } else {
          setError('Invalid email or password. Please check your credentials and try again.');
        }
        setLoading(false);
        return;
      }

      // Mark as signed-in — the useEffect above will redirect once useSession
      // confirms the session is live (avoids race condition with cookie/DB)
      setSignedIn(true);

      // Fallback: if session doesn't update within 3s, do a hard redirect
      setTimeout(() => {
        window.location.href = callbackUrl;
      }, 3000);
    } catch (err: any) {
      setError('An unexpected connection error occurred. Please try again.');
      setLoading(false);
    }
  };

  // While redirecting, show a spinner
  if (signedIn) {
    return (
      <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-300 shadow-sm text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08804] mx-auto mb-3" />
        <p className="text-sm text-gray-600">Signing you in...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-7 sm:p-8 rounded-lg border border-gray-300 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-5">
        Sign in
      </h1>

      {isJustVerified && (
        <div className="mb-5 p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>Your email was successfully verified! Please sign in below.</span>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3.5 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="leading-relaxed">{error}</p>
            {error.includes('verify your email') && (
              <Link 
                href={`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                className="font-bold text-[#007185] hover:underline block pt-1"
              >
                Go to verification page →
              </Link>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-gray-900 mb-1">
            Email or mobile phone number
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-xs font-bold text-gray-900">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#007185] hover:underline hover:text-[#c7511f]"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
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
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded text-[#f08804] focus:ring-[#f08804] w-3.5 h-3.5 cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-xs text-gray-700 cursor-pointer select-none">
            Keep me signed in on this device
          </label>
        </div>

        {/* Sign In CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm transition-all border border-[#fcd34d] flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-wait' : 'cursor-pointer active:scale-[0.99]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#131921] border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </div>
      </form>

      {/* Conditions */}
      <p className="text-[11px] text-gray-600 mt-5 leading-relaxed">
        By continuing, you agree to Project Apex's{' '}
        <Link href="/legal/conditions-of-use" className="text-[#007185] hover:underline">Conditions of Use</Link> and{' '}
        <Link href="/legal/privacy-notice" className="text-[#007185] hover:underline">Privacy Notice</Link>.
      </p>

      {/* New to Apex Divider */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <div className="relative flex justify-center text-xs mb-4">
          <span className="bg-white px-3 text-gray-500 font-medium relative -top-3">
            New to Project Apex?
          </span>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center justify-center w-full py-2 px-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs rounded-full border border-gray-300 shadow-2xs transition-colors"
        >
          Create your Project Apex account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
