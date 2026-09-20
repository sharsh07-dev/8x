'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import { 
  Package, 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  User, 
  HelpCircle, 
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function AccountOverviewPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?callbackUrl=/account');
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08804]" />
      </div>
    );
  }

  const accountCards = [
    {
      icon: Package,
      title: 'Your Orders',
      description: 'Track, return, cancel an order, download invoice or buy again',
      href: '/account/orders',
    },
    {
      icon: ShieldCheck,
      title: 'Login & Security',
      description: 'Edit name, mobile number, change password, and sign out from other devices',
      href: '/account/security',
    },
    {
      icon: MapPin,
      title: 'Your Addresses',
      description: 'Edit, remove or set default delivery addresses for orders and gifts',
      href: '/account/addresses',
    },
    {
      icon: User,
      title: 'Your Profile',
      description: 'Manage your public name and profile preferences',
      href: '/account/profile',
    },
    {
      icon: CreditCard,
      title: 'Payment Options',
      description: 'Review Razorpay integration, card payments, and checkout settings',
      href: '/checkout',
    },
    {
      icon: HelpCircle,
      title: 'Customer Service & Help',
      description: 'Browse help articles or track return requests and shipping policies',
      href: '/help',
    },
    {
      icon: Sparkles,
      title: 'Your Reviews',
      description: 'View feedback you submitted, track helpful votes, or manage reviews',
      href: '/account/reviews',
    },
  ];

  return (
    <div className="min-h-screen bg-[#eaeded] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Your Account
              </h1>
              <span className="text-xs bg-[#fef0c7] text-[#92400e] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#f08804]" /> Prime Member
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Signed in as <strong className="text-gray-900">{session.user.name}</strong> ({session.user.email})
            </p>
          </div>

          <button
            onClick={async () => {
              await signOut();
              router.push('/');
              router.refresh();
            }}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white p-5 rounded-lg border border-gray-300 hover:border-gray-400 hover:shadow-md transition-all flex gap-4 items-start group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-200 group-hover:bg-[#fef0c7] group-hover:border-[#fcd34d] transition-colors">
                  <Icon className="w-6 h-6 text-gray-700 group-hover:text-[#f08804]" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-[#007185] transition-colors flex items-center justify-between">
                    <span>{card.title}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
