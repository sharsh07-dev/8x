'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, changePassword, revokeOtherSessions } from '@/lib/auth-client';
import { 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function SecurityPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [revoking, setRevoking] = useState(false);
  const [sessionSuccess, setSessionSuccess] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?callbackUrl=/account/security');
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08804]" />
      </div>
    );
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please re-enter.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res.error) {
        setPasswordError(res.error.message || 'Current password is incorrect.');
        setSavingPassword(false);
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordError('A network error occurred. Please try again.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevokeSessions = async () => {
    setRevoking(true);
    setSessionSuccess(false);
    try {
      await revokeOtherSessions();
      setSessionSuccess(true);
    } catch {
      alert('Unable to revoke other sessions. Please try again.');
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaeded] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/account" className="text-[#007185] hover:underline">Your Account</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-800 font-medium">Login & Security</span>
        </nav>

        {/* Change Password Card */}
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-300 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-[#f08804]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Change Password</h1>
              <p className="text-xs text-gray-500">
                Use a strong, unique password with at least 8 characters.
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password updated successfully! Other active sessions were revoked.</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3.5 rounded-md bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1">
                Current password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1">
                New password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="w-full px-3 py-2 text-xs border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1">
                Re-enter new password
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-gray-400 rounded focus:border-[#e77600] focus:ring-1 focus:ring-[#e77600] outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-xs text-[#007185] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPasswords ? 'Hide passwords' : 'Show passwords'}</span>
              </button>

              <button
                type="submit"
                disabled={savingPassword}
                className="py-2 px-5 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm border border-[#fcd34d] cursor-pointer transition-colors"
              >
                {savingPassword ? 'Updating...' : 'Save password'}
              </button>
            </div>
          </form>
        </div>

        {/* Session Management Card */}
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-gray-300 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Sessions</h2>
              <p className="text-xs text-gray-500">
                Manage your active sign-ins across browsers and mobile devices.
              </p>
            </div>
          </div>

          {sessionSuccess && (
            <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All other devices have been signed out.</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-900">Current Session</p>
              <p className="text-[11px] text-gray-500">
                Signed in on macOS · Chrome / Safari browser
              </p>
            </div>

            <button
              type="button"
              onClick={handleRevokeSessions}
              disabled={revoking}
              className="self-start sm:self-auto py-2 px-4 bg-white hover:bg-gray-50 text-gray-800 font-semibold text-xs rounded-full border border-gray-300 shadow-2xs cursor-pointer transition-colors"
            >
              {revoking ? 'Signing out...' : 'Sign out from all other devices'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
