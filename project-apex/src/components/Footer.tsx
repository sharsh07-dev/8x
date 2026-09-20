'use client';

import React from 'react';
import Link from 'next/link';
import { Globe } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#232f3e] text-white text-xs mt-12 select-none">
      {/* Back to top button */}
      <button 
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] py-3.5 text-center text-xs font-semibold cursor-pointer transition-colors duration-150 tracking-wide"
      >
        Back to top
      </button>

      {/* Main footer directory */}
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-sm text-white mb-3">Get to Know Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/about" className="hover:underline">About Apex</Link></li>
            <li><Link href="/about" className="hover:underline">Careers</Link></li>
            <li><Link href="/departments" className="hover:underline">Our Marketplace</Link></li>
            <li><Link href="/collections/bestsellers-tech" className="hover:underline">Featured Tech</Link></li>
            <li><Link href="/todays-deals" className="hover:underline">Today's Deals</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm text-white mb-3">Shop With Us</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/electronics" className="hover:underline">Electronics &amp; Audio</Link></li>
            <li><Link href="/clothing" className="hover:underline">Clothing &amp; Fashion</Link></li>
            <li><Link href="/home-kitchen" className="hover:underline">Home &amp; Kitchen</Link></li>
            <li><Link href="/beauty" className="hover:underline">Beauty &amp; Care</Link></li>
            <li><Link href="/books" className="hover:underline">Books &amp; Stationery</Link></li>
            <li><Link href="/sports" className="hover:underline">Sports &amp; Fitness</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm text-white mb-3">Apex Payment Products</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/checkout" className="hover:underline">Razorpay Secure Checkout</Link></li>
            <li><Link href="/checkout" className="hover:underline">Shop with Points</Link></li>
            <li><Link href="/checkout" className="hover:underline">Cash on Delivery</Link></li>
            <li><Link href="/help" className="hover:underline">Payment Security</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-sm text-white mb-3">Let Us Help You</h3>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/account" className="hover:underline">Your Account</Link></li>
            <li><Link href="/account/orders" className="hover:underline">Your Orders</Link></li>
            <li><Link href="/account/addresses" className="hover:underline">Shipping &amp; Addresses</Link></li>
            <li><Link href="/help" className="hover:underline">Returns &amp; Replacements</Link></li>
            <li><Link href="/account/security" className="hover:underline">Login &amp; Security</Link></li>
            <li><Link href="/help" className="hover:underline">Customer Help Hub</Link></li>
          </ul>
        </div>
      </div>

      {/* Brand divider */}
      <div className="border-t border-gray-700 py-6 flex flex-wrap items-center justify-center gap-6 text-gray-300">
        <Link href="/" className="text-xl font-black text-white flex items-center">
          apex<span className="text-[#f08804]">.</span>
        </Link>
        <div className="flex items-center gap-2 border border-gray-500 rounded px-3 py-1 cursor-pointer hover:border-gray-400">
          <Globe className="w-3.5 h-3.5" />
          <span>English</span>
        </div>
        <div className="border border-gray-500 rounded px-3 py-1 cursor-pointer hover:border-gray-400">
          $ USD - U.S. Dollar
        </div>
        <div className="border border-gray-500 rounded px-3 py-1 cursor-pointer hover:border-gray-400">
          🇺🇸 United States
        </div>
      </div>

      {/* Sub-footer copyright */}
      <div className="bg-[#131921] py-8 px-4 text-center text-gray-400 text-[11px] space-y-2">
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/legal/conditions-of-use" className="hover:underline">Conditions of Use</Link>
          <Link href="/legal/privacy-notice" className="hover:underline">Privacy Notice</Link>
          <Link href="/legal/privacy-notice" className="hover:underline">Consumer Health Data Privacy</Link>
          <Link href="/account/security" className="hover:underline">Your Security Choices</Link>
        </div>
        <p>© 2026, Project Apex, Inc. or its affiliates. Built for 8x assignment.</p>
      </div>
    </footer>
  );
}
