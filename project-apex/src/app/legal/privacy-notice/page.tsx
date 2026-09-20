import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

export const metadata = {
  title: 'Privacy Notice - Project Apex',
  description: 'How Project Apex collects, uses, and safeguards customer personal information.',
};

export default function PrivacyNoticePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-10 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#007185] hover:underline mb-4 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Apex Storefront
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-[#007185]">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Apex Privacy Notice</h1>
              <p className="text-xs text-gray-500 mt-1">Last updated: September 20, 2026</p>
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-4 leading-relaxed">
          <p>
            We know that you care how information about you is used and shared, and we appreciate your trust
            that we will do so carefully and sensibly. This Privacy Notice describes how Project Apex and its
            affiliates collect and process your personal information through Apex websites, devices, products, and services.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-2">1. Personal Information We Collect</h2>
          <p>
            We collect your personal information in order to provide and continually improve our products and services.
            This includes account registration information (name, verified email, phone number), delivery addresses,
            payment transaction identifiers, and order history records.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-2">2. For What Purposes Do We Use Your Personal Information?</h2>
          <p>
            We use your personal information to operate, provide, develop, and improve the products and services that we
            offer our customers, including taking and handling orders, delivering products, processing payments, and
            communicating with you about orders and account updates.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-2">3. Payment &amp; Security Compliance</h2>
          <p>
            Project Apex designs systems with your security and privacy in mind. We maintain physical, electronic, and
            procedural safeguards in connection with the collection, storage, and disclosure of personal customer information.
            Payment card processing utilizes tokenized gateway integrations (such as Razorpay) to ensure no raw credit card
            numbers are stored on our servers.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-2">4. Your Choices &amp; Rights</h2>
          <p>
            You can view, update, and manage your account information, addresses, order history, security settings,
            and customer reviews directly in your{' '}
            <Link href="/account" className="text-[#007185] hover:underline font-semibold">
              Apex Account Dashboard
            </Link>.
          </p>
        </div>

        <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
          <span>Questions regarding our privacy practices?</span>
          <Link
            href="/help"
            className="text-[#007185] hover:underline font-semibold"
          >
            Contact Customer Support &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
