'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Phone, CheckCircle2, AlertCircle, ArrowRight, RotateCw, Smartphone, KeyRound, Zap } from 'lucide-react';
import { sendVerificationEmail } from '@/lib/auth-client';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const phoneParam = searchParams.get('phone') || '';

  const [activeTab, setActiveTab] = useState<'email' | 'mobile'>(phoneParam ? 'mobile' : 'email');

  // Email resend state
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Mobile verification state
  const [phoneNumber, setPhoneNumber] = useState(phoneParam);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [testOtp, setTestOtp] = useState<string | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // Instant developer activation
  const [instantLoading, setInstantLoading] = useState(false);

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
        setResendStatus('A new verification email has been sent to your test inbox.');
        setCountdown(60);
      }
    } catch {
      setResendStatus('A network error occurred. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setPhoneMessage({ type: 'error', text: 'Please enter a valid mobile number.' });
      return;
    }

    setPhoneLoading(true);
    setPhoneMessage(null);

    try {
      const res = await fetch('/api/auth/phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email,
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setOtpSent(true);
      setTestOtp(data.testOtp);
      setPhoneMessage({
        type: 'success',
        text: `SMS OTP dispatched to ${phoneNumber.trim()}! Enter the 6-digit code below.`,
      });
      setCountdown(45);
    } catch (err: any) {
      setPhoneMessage({ type: 'error', text: err.message || 'Error sending SMS OTP' });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length !== 6) {
      setPhoneMessage({ type: 'error', text: 'Please enter the 6-digit code.' });
      return;
    }

    setPhoneLoading(true);
    setPhoneMessage(null);

    try {
      const res = await fetch('/api/auth/phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      setIsVerified(true);
      setPhoneMessage({
        type: 'success',
        text: 'Phone number verified and account activated successfully!',
      });

      setTimeout(() => {
        router.push('/login?activated=true');
      }, 2000);
    } catch (err: any) {
      setPhoneMessage({ type: 'error', text: err.message || 'Verification failed' });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleInstantVerify = async () => {
    if (!email) return;
    setInstantLoading(true);
    try {
      const res = await fetch('/api/auth/phone-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'instant_verify',
          email,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsVerified(true);
        setTimeout(() => {
          router.push('/login?activated=true');
        }, 1500);
      }
    } catch {
      // ignore
    } finally {
      setInstantLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-7 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
      {/* Verification Tabs: Email vs Mobile */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('email')}
          className={`flex-1 py-2 rounded-md transition flex items-center justify-center gap-1.5 ${
            activeTab === 'email'
              ? 'bg-white text-gray-900 shadow-xs font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-amber-500" />
          Email Link
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mobile')}
          className={`flex-1 py-2 rounded-md transition flex items-center justify-center gap-1.5 ${
            activeTab === 'mobile'
              ? 'bg-white text-gray-900 shadow-xs font-bold'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
          Mobile Number (SMS OTP)
        </button>
      </div>

      {isVerified ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Account Activated!</h2>
          <p className="text-xs text-gray-600">Redirecting to sign-in page...</p>
          <Link
            href="/login"
            className="inline-block mt-3 px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg transition"
          >
            Sign In Now
          </Link>
        </div>
      ) : activeTab === 'email' ? (
        /* Email Tab */
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 text-amber-600">
            <Mail className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email address</h1>

          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            We sent a verification link to{' '}
            <strong className="text-gray-900">{email || 'your email address'}</strong>.
            Click the link in your email to activate your account.
          </p>

          {resendStatus && (
            <div className="mb-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resendStatus}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {email && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || countdown > 0}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-2 ${
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

            <button
              type="button"
              onClick={() => setActiveTab('mobile')}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Not receiving email? Verify with Mobile Number</span>
            </button>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Mobile Verification Tab */
        <div>
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
            <Smartphone className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 text-center mb-1">
            Verify via Mobile Number
          </h2>
          <p className="text-xs text-gray-500 text-center mb-5">
            Enter your mobile number to receive a 6-digit SMS verification code.
          </p>

          {phoneMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                phoneMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {phoneMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{phoneMessage.text}</span>
            </div>
          )}

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile / Phone Number
                </label>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-1 focus-within:ring-amber-500 focus-within:border-amber-500">
                  <span className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 border-r border-gray-300 flex items-center">
                    +91 / +1
                  </span>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="flex-1 px-3 py-2 text-xs outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={phoneLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {phoneLoading ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending SMS OTP...</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-3.5 h-3.5" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="block text-xs font-bold text-gray-700">
                    Enter 6-Digit SMS Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[11px] text-cyan-700 hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.5em] font-mono font-bold text-lg border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>

              {testOtp && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
                  <span>
                    Test SMS OTP: <strong className="font-mono text-sm">{testOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtp(testOtp)}
                    className="bg-amber-200 hover:bg-amber-300 text-amber-950 px-2 py-0.5 rounded text-[11px] font-bold transition"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={phoneLoading || otp.length !== 6}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {phoneLoading ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Verify Code &amp; Activate</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className="text-cyan-700 hover:underline"
            >
              ← Back to Email Verification
            </button>
            <Link href="/login" className="text-gray-500 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* 1-Click Instant Activation for Local Sandbox */}
      {!isVerified && email && (
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={handleInstantVerify}
            disabled={instantLoading}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{instantLoading ? 'Activating Account...' : 'Instant 1-Click Activate (Dev Mode)'}</span>
          </button>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Bypasses external inbox delivery during local testing.
          </p>
        </div>
      )}
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

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white p-8 rounded-lg border border-gray-300 shadow-sm text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08804] mx-auto" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
