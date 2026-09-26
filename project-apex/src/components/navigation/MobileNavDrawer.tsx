'use client';

import React from 'react';
import Link from 'next/link';
import { X, Sparkles, Shirt, Tv, Home, BookOpen, Dumbbell, Flame, Palette, ChevronRight, User, Package, LogOut } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_SECTIONS = [
  {
    label: 'Categories',
    items: [
      { icon: Shirt,     label: 'Clothing & Fashion',    href: '/clothing-fashion' },
      { icon: Home,      label: 'Home & Kitchen',        href: '/home-kitchen' },
      { icon: Tv,        label: 'Electronics',            href: '/electronics' },
      { icon: Palette,   label: 'Health & Beauty',       href: '/health-personalcare' },
      { icon: Dumbbell,  label: 'Toys & Games',          href: '/toys-games' },
      { icon: BookOpen,  label: 'Home Improvement',      href: '/homeimprovement' },
    ],
  },
  {
    label: 'Discover',
    items: [
      { icon: Flame,    label: "Today's Deals",   href: '/todays-deals', accent: true },
      { icon: Sparkles, label: 'Collections',     href: '/departments' },
    ],
  },
];

export default function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const { data: session } = useSession();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-[#171717]/40 backdrop-blur-[2px] z-50 transition-opacity duration-220 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
        className={`fixed top-0 left-0 bottom-0 w-[300px] max-w-[80vw] bg-[#F9F6F1] z-50 flex flex-col transition-transform duration-320 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#171717]">
          <Link
            href="/"
            onClick={onClose}
            className="text-xl font-bold text-white hover:text-[#F6B7A3] transition-colors"
           
          >
            PEHNO
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User section */}
        <div className="px-5 py-4 bg-white border-b border-[#E3E1DD]">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E67661] flex items-center justify-center text-white font-bold text-base">
                {session.user.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#171717]">{session.user.name}</p>
                <p className="text-xs text-[#6B7280] truncate max-w-[180px]">{session.user.email}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-[#6B7280]">Sign in to get personalised recommendations</p>
              <Link
                href="/login"
                onClick={onClose}
                className="btn-primary w-full text-center justify-center text-sm"
                style={{ borderRadius: '8px', minHeight: 'auto', padding: '10px 16px' }}
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        {/* Nav sections */}
        <div className="flex-1 overflow-y-auto py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#6B7280] mb-1">
                {section.label}
              </p>
              {section.items.map(({ icon: Icon, label, href, accent }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors hover:bg-[#E3E1DD] ${
                    accent ? 'text-[#E67661]' : 'text-[#171717]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#6B7280]" />
                  {label}
                  <ChevronRight className="w-3.5 h-3.5 text-[#6B7280] ml-auto" />
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Account actions */}
        {session?.user && (
          <div className="border-t border-[#E3E1DD] bg-white py-2">
            {[
              { icon: Package, label: 'Your Orders', href: '/account/orders' },
              { icon: User,    label: 'Your Account', href: '/account' },
            ].map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className="flex items-center gap-3 px-5 py-3 text-sm text-[#171717] hover:bg-[#F9F6F1] transition-colors"
              >
                <Icon className="w-4 h-4 text-[#6B7280]" />
                {label}
              </Link>
            ))}
            <button
              onClick={() => { signOut(); onClose(); }}
              className="flex items-center gap-3 px-5 py-3 text-sm text-[#C2413A] hover:bg-[rgba(194,65,58,0.06)] w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
