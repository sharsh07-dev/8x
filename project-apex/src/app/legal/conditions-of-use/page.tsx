import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';

export const metadata = {
  title: 'Conditions of Use - Project Apex',
  description: 'Terms and conditions governing the use of Project Apex marketplace.',
};

export default function ConditionsOfUsePage() {
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
            <div className="p-2 bg-amber-50 rounded-lg text-[#f08804]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Apex Conditions of Use</h1>
              <p className="text-xs text-gray-500 mt-1">Last updated: September 20, 2026</p>
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-4 leading-relaxed">
          <p>
            Welcome to Project Apex. Project Apex and its affiliates provide website features and other products
            and services to you when you visit or shop at Project Apex, use Apex devices, products, or services.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or placing orders through Project Apex, you agree to be bound by these Conditions of Use,
            our Privacy Notice, and all policies referenced herein.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-2">2. Electronic Communications</h2>
          <p>
            When you use Project Apex services or send emails, text messages, and other communications from your
            desktop or mobile device to us, you may be communicating with us electronically. You consent to receive
            communications from us electronically.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-2">3. Your Account</h2>
          <p>
            You may need your own Apex account to use certain services, and you may be required to be logged in to
            the account and have a valid payment method associated with it. You are responsible for maintaining the
            confidentiality of your account and password.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-2">4. Reviews, Comments, and Submissions</h2>
          <p>
            Visitors may post customer reviews, comments, and photos so long as the content is not illegal, obscene,
            threatening, defamatory, invasive of privacy, or infringing of intellectual property rights. Project Apex
            reserves the right to moderate, remove, or edit such content.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-2">5. Risk of Loss &amp; Pricing</h2>
          <p>
            All purchases of physical items from Project Apex are made pursuant to a shipment contract. Prices and
            inventory availability are confirmed upon transactional checkout placement.
          </p>
        </div>

        <div className="pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
          <span>Need further assistance?</span>
          <Link
            href="/help"
            className="text-[#007185] hover:underline font-semibold"
          >
            Visit Customer Service &amp; Help Hub &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
