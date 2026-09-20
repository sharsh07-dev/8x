import React from 'react';
import Link from 'next/link';
import { 
  Package, 
  RotateCcw, 
  CreditCard, 
  ShieldCheck, 
  MapPin, 
  HelpCircle, 
  ArrowLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

export const metadata = {
  title: 'Customer Service & Help Hub - Project Apex',
  description: 'Track orders, manage returns, update addresses, and find answers to common questions.',
};

export default function HelpHubPage() {
  const helpTopics = [
    {
      title: 'Your Orders',
      desc: 'Track packages, edit delivery options, or view order receipts.',
      icon: Package,
      href: '/account/orders',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Returns & Replacements',
      desc: 'Return items, check return status, or request a replacement.',
      icon: RotateCcw,
      href: '/account/orders',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Payment & Gift Cards',
      desc: 'Add or edit payment methods, Razorpay integration, and points.',
      icon: CreditCard,
      href: '/checkout',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Address Book',
      desc: 'Manage shipping addresses and delivery preferences.',
      icon: MapPin,
      href: '/account/addresses',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Login & Security',
      desc: 'Update password, mobile OTP verification, and security events.',
      icon: ShieldCheck,
      href: '/account/security',
      color: 'text-rose-600 bg-rose-50',
    },
    {
      title: 'Customer Reviews',
      desc: 'View feedback you submitted or share your experience.',
      icon: MessageSquare,
      href: '/account/reviews',
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-lg p-6 sm:p-8 shadow-xs border border-gray-200">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#007185] hover:underline mb-3 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Storefront
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-xl text-[#f08804]">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Hello. What can we help you with today?
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Browse our self-service tools and order management options.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Self Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {helpTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                key={topic.title}
                href={topic.href}
                className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-400 hover:shadow-md transition group flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg shrink-0 ${topic.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#007185] transition-colors text-base flex items-center gap-1">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      {topic.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#007185] font-semibold">
                  <span>Manage</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-white rounded-lg p-6 sm:p-8 shadow-xs border border-gray-200 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-bold text-gray-900">Where is my order?</h3>
              <p className="text-xs text-gray-600 mt-1">
                You can track package shipments and delivery estimates in your{' '}
                <Link href="/account/orders" className="text-[#007185] hover:underline font-semibold">
                  Orders History
                </Link>.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">What payment methods are supported?</h3>
              <p className="text-xs text-gray-600 mt-1">
                We support Razorpay (Cards, UPI, Netbanking), Cash on Delivery (COD), and Apex Reward Points.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">How do I verify my account?</h3>
              <p className="text-xs text-gray-600 mt-1">
                You can verify via email link or instant SMS mobile OTP in{' '}
                <Link href="/verify-email" className="text-[#007185] hover:underline font-semibold">
                  Account Verification
                </Link>.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
