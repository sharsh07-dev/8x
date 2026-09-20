'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth-client';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Lock, Mail, User } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
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
      const cleanEmail = email.trim().toLowerCase();
      const res = await signUp.email({
        name: name.trim(),
        email: cleanEmail,
        password,
        callbackURL: '/verify-email',
      });

      if (res.error) {
        // Safe duplicate email and validation messaging
        if (res.error.message?.toLowerCase().includes('already exists') || res.error.status === 422) {
          setError('An account with this email address already exists. Please sign in or use password assistance.');
        } else {
          setError(res.error.message || 'Unable to create account. Please check your information and try again.');
        }
        setLoading(false);
        return;
      }

      // If phone was provided, register phone OTP
      if (phone.trim()) {
        try {
          await fetch('/api/auth/phone-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'send',
              email: cleanEmail,
              phoneNumber: phone.trim(),
            }),
          });
        } catch {
          // ignore background phone save error
        }
      }

      // Successful registration -> Navigate to verify page with phone pre-filled
      const phoneParam = phone.trim() ? `&phone=${encodeURIComponent(phone.trim())}` : '';
      router.push(`/verify-email?email=${encodeURIComponent(cleanEmail)}${phoneParam}`);
    } catch (err: any) {
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#eaeded] py-10 px-4 flex flex-col items-center justify-center font-sans">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link href="/" className="text-3xl font-black tracking-tight text-[#131921]">
          apex<span className="text-[#f08804]">.</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white p-7 sm:p-8 rounded-lg border border-gray-300 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-5">
          Create Account
        </h1>

        {error && (
          <div className="mb-5 p-3.5 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Your Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-bold text-gray-900 mb-1">
              Your name
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First and last name"
                required
                className="w-full px-3 py-2 text-xs border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Mobile Number (Optional for SMS OTP) */}
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-gray-900 mb-1">
              Mobile number <span className="font-normal text-gray-500">(for instant SMS OTP verification)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 7822983308 or +91 7822983308"
              className="w-full px-3 py-2 text-xs border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-900 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
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

          {/* Re-enter Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-900 mb-1">
              Re-enter password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
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

          {/* Submit Button */}
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
                  <span>Creating your account...</span>
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </div>
        </form>

        {/* Legal notice */}
        <p className="text-[11px] text-gray-600 mt-5 leading-relaxed">
          By creating an account, you agree to Project Apex's{' '}
          <Link href="/legal/conditions-of-use" className="text-[#007185] hover:underline">Conditions of Use</Link> and{' '}
          <Link href="/legal/privacy-notice" className="text-[#007185] hover:underline">Privacy Notice</Link>.
        </p>

        {/* Switch to login */}
        <div className="border-t border-gray-200 mt-6 pt-4 text-xs text-gray-700">
          Already have an account?{' '}
          <Link href="/login" className="text-[#007185] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
