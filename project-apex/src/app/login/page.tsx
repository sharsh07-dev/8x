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
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#E3E1DD] shadow-sm text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#171717] border-t-transparent mx-auto mb-3" />
        <p className="text-sm text-[#6B7280]">Signing you in…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-[#E3E1DD] shadow-[0_4px_32px_-8px_rgba(23,23,23,0.10)]">
      <h1 className="text-2xl font-bold text-[#171717] mb-1">
        Sign in to PEHNO
      </h1>
      <p className="text-sm text-[#6B7280] mb-6">Good to have you back.</p>

      {isJustVerified && (
        <div className="mb-5 p-4 rounded-xl bg-[rgba(47,125,90,0.08)] border border-[rgba(47,125,90,0.20)] flex items-start gap-3 text-sm text-[#2F7D5A]">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Your email was verified! Please sign in below.</span>
        </div>
      )}

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-[rgba(194,65,58,0.06)] border border-[rgba(194,65,58,0.20)] flex items-start gap-3 text-sm text-[#C2413A]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="leading-relaxed">{error}</p>
            {error.includes('verify your email') && (
              <Link
                href={`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                className="font-semibold text-[#E67661] hover:underline block pt-1"
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
          <label htmlFor="email" className="block text-sm font-medium text-[#171717] mb-1.5">
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
            className="pehno-input"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-sm font-medium text-[#171717]">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#E67661] hover:underline"
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
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="pehno-input pr-12"
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
            className="rounded w-4 h-4 border-[#E3E1DD] text-[#171717] cursor-pointer"
          />
          <label htmlFor="rememberMe" className="text-sm text-[#6B7280] cursor-pointer select-none">
            Keep me signed in
          </label>
        </div>

        {/* Sign In CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`btn-primary w-full justify-center mt-2 ${
              loading ? 'opacity-70 cursor-wait' : ''
            }`}
            style={{ borderRadius: '12px', minHeight: '52px', fontSize: '15px' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing in…</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </div>
      </form>

      {/* Conditions */}
      <p className="text-xs text-[#6B7280] mt-6 leading-relaxed">
        By signing in, you agree to PEHNO's{' '}
        <Link href="/legal/conditions-of-use" className="text-[#E67661] hover:underline">Conditions of Use</Link> and{' '}
        <Link href="/legal/privacy-notice" className="text-[#E67661] hover:underline">Privacy Notice</Link>.
      </p>

      {/* New to Apex Divider */}
      <div className="mt-6 pt-6 border-t border-[#E3E1DD] text-center">
        <p className="text-sm text-[#6B7280]">
          New to PEHNO?{' '}
          <Link href="/register" className="font-semibold text-[#E67661] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#F9F6F1] py-12 px-4 flex flex-col items-center justify-center">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-3xl font-bold text-[#171717] hover:text-[#E67661] transition-colors"
         
        >
          PEHNO
        </Link>
        <p className="text-xs text-[#6B7280] mt-1 uppercase tracking-widest">Discover · Try · Decide · Buy</p>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-[#E3E1DD] text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#171717] border-t-transparent mx-auto" />
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
