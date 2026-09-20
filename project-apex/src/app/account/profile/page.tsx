'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { ChevronRight, CheckCircle2, AlertCircle, User, Mail, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?callbackUrl=/account/profile');
    } else if (session?.user) {
      setName(session.user.name || '');
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08804]" />
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim()) {
      setError('Name cannot be blank.');
      return;
    }

    setSaving(true);
    try {
      // Update user name in database via API
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to update name');
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError('Unable to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeded] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/account" className="text-[#007185] hover:underline">Your Account</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-800 font-medium">Your Profile</span>
        </nav>

        <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-300 shadow-xs space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-xs text-gray-600 mt-1">
              Manage your personal information and account details.
            </p>
          </div>

          {success && (
            <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your profile has been updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-gray-900 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
              />
            </div>

            {/* Email (Read-only for security) */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1">
                Email address
              </label>
              <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-300 rounded text-xs">
                <span className="text-gray-700 font-medium">{session.user.email}</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                To change your email address, please contact security support.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm border border-[#fcd34d] cursor-pointer transition-colors"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
