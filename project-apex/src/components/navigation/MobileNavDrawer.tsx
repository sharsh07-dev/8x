'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  User,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ShoppingBag,
  Package,
  ShieldCheck,
  LogOut,
  Tag,
  Layers,
} from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { DEPARTMENTS } from '@/data/departments';
import { COLLECTIONS } from '@/data/collections';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [expandedDept, setExpandedDept] = useState<string | null>('clothing');

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleDept = (slug: string) => {
    setExpandedDept(expandedDept === slug ? null : slug);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Menu Panel */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300 overflow-hidden">
        {/* User Greeting Header */}
        <div className="bg-[#131921] px-5 py-4 text-white flex items-center justify-between shrink-0">
          <Link
            href={session?.user ? '/account' : '/login'}
            onClick={onClose}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-full bg-[#232f3e] flex items-center justify-center text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-900 transition">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-300">Hello,</p>
              <p className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                {session?.user?.name ? session.user.name : 'Sign In'}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded-md transition"
            aria-label="Close navigation drawer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100 text-xs font-sans">
          {/* Trending & Quick Shortcuts */}
          <div className="py-3 px-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
              Trending &amp; Deals
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/todays-deals"
                  onClick={onClose}
                  className="flex items-center justify-between py-2 text-amber-700 hover:text-amber-900 font-bold hover:bg-amber-50 rounded px-2 transition"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Today's Deals
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                </Link>
              </li>
              <li>
                <Link
                  href="/departments"
                  onClick={onClose}
                  className="flex items-center justify-between py-2 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-50 rounded px-2 transition"
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-500" />
                    All Departments Directory
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop By Department */}
          <div className="py-3 px-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
              Shop by Department
            </h3>
            <div className="space-y-1">
              {DEPARTMENTS.map((dept) => {
                const isExpanded = expandedDept === dept.slug;
                return (
                  <div key={dept.id} className="border-b border-gray-50 last:border-0">
                    <div
                      className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 cursor-pointer transition select-none"
                      onClick={() => toggleDept(dept.slug)}
                    >
                      <Link
                        href={`/${dept.slug}`}
                        onClick={(e) => {
                          // If clicking link directly, let it navigate
                          e.stopPropagation();
                          onClose();
                        }}
                        className="font-bold text-gray-900 hover:text-amber-600 transition"
                      >
                        {dept.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleDept(dept.slug)}
                        className="p-1 text-gray-400 hover:text-gray-700"
                        aria-label={`Expand ${dept.name}`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-amber-600" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="pl-4 pb-2 pt-1 space-y-1 bg-gray-50/70 rounded-md mb-1">
                        <Link
                          href={`/${dept.slug}`}
                          onClick={onClose}
                          className="block py-1 px-2 font-bold text-amber-700 hover:underline"
                        >
                          All {dept.shortName} →
                        </Link>
                        {dept.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/${dept.slug}/${sub.slug}`}
                            onClick={onClose}
                            className="block py-1 px-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Curated Collections */}
          <div className="py-3 px-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
              Featured Collections
            </h3>
            <ul className="space-y-1">
              {COLLECTIONS.map((col) => (
                <li key={col.id}>
                  <Link
                    href={`/collections/${col.slug}`}
                    onClick={onClose}
                    className="flex items-center justify-between py-2 px-2 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-50 rounded transition"
                  >
                    <span>{col.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                      {col.tag}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Settings */}
          <div className="py-3 px-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
              Help &amp; Account
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-2 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-50 rounded transition"
                >
                  <span>Your Account</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-2 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-50 rounded transition"
                >
                  <span>Your Orders</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-between py-2 px-2 text-gray-700 hover:text-gray-900 font-medium hover:bg-gray-50 rounded transition"
                >
                  <span>Shopping Cart</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </Link>
              </li>
              {session?.user ? (
                <li>
                  <button
                    type="button"
                    onClick={async () => {
                      onClose();
                      await signOut();
                      router.push('/');
                      router.refresh();
                    }}
                    className="w-full text-left py-2 px-2 text-rose-700 hover:bg-rose-50 rounded font-bold transition flex items-center justify-between"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </li>
              ) : (
                <li>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="block py-2 px-2 text-amber-700 hover:bg-amber-50 rounded font-bold transition"
                  >
                    Sign In to Your Account →
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
