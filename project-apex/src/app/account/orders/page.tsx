'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Package, ChevronRight, Search, ShoppingCart } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?callbackUrl=/account/orders');
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08804]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaeded] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/account" className="text-[#007185] hover:underline">Your Account</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-800 font-medium">Your Orders</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
          <div className="flex items-center max-w-xs border border-gray-300 rounded-md bg-white overflow-hidden text-xs">
            <input
              type="text"
              placeholder="Search all orders"
              className="px-3 py-1.5 outline-none flex-1"
            />
            <button className="bg-[#febd69] hover:bg-[#f3a847] px-3 py-1.5 font-bold cursor-pointer">
              Search
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-300 text-xs font-semibold gap-6 pb-2">
          <span className="text-gray-900 border-b-2 border-[#f08804] pb-2 cursor-pointer">
            Orders
          </span>
          <span className="text-gray-500 hover:text-gray-800 cursor-pointer">
            Buy Again
          </span>
          <span className="text-gray-500 hover:text-gray-800 cursor-pointer">
            Not Yet Shipped
          </span>
          <span className="text-gray-500 hover:text-gray-800 cursor-pointer">
            Cancelled Orders
          </span>
        </div>

        {/* Empty orders state */}
        <div className="bg-white p-8 rounded-lg border border-gray-300 shadow-2xs text-center space-y-4">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              No orders found
            </h2>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              You haven't placed any orders yet. Explore our live catalog to discover today's top deals.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 py-2 px-6 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs rounded-full shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Start shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
