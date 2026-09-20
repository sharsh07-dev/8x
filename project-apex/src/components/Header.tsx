'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShoppingCart, 
  MapPin, 
  Menu, 
  ChevronDown, 
  User, 
  Sparkles 
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { categories } from '@/data/mockProducts';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  const { data: session } = useSession();
  const totalItems = useCartStore((state) => state.getTotalItems());
  const setIsDrawerOpen = useCartStore((state) => state.setIsDrawerOpen);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex flex-col text-white font-sans text-sm select-none shadow-md">
      {/* Top Header Bar */}
      <div className="bg-[#131921] px-4 py-2 flex items-center justify-between gap-3 md:gap-4">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center gap-1 p-1.5 border border-transparent hover:border-white rounded cursor-pointer transition-colors duration-150"
        >
          <span className="text-2xl font-black tracking-tight text-white flex items-center">
            apex<span className="text-[#f08804]">.</span>
          </span>
          <span className="text-[10px] bg-[#f08804] text-[#131921] font-bold px-1.5 py-0.5 rounded ml-0.5 tracking-wider uppercase">
            Prime
          </span>
        </Link>

        {/* Deliver To */}
        <div className="hidden lg:flex items-center gap-1 p-1.5 border border-transparent hover:border-white rounded cursor-pointer transition-colors duration-150 text-xs">
          <MapPin className="w-4 h-4 text-gray-300 self-end mb-0.5" />
          <div className="flex flex-col leading-tight">
            <span className="text-gray-400 text-[11px]">Deliver to</span>
            <span className="font-bold text-white">Seattle 98101</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-3xl flex items-center h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#f08804] bg-white text-gray-900 shadow-inner">
          <div className="relative hidden sm:flex items-center bg-gray-100 hover:bg-gray-200 border-r border-gray-300 text-xs text-gray-700 px-3 h-full cursor-pointer transition-colors">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent appearance-none pr-4 outline-none cursor-pointer font-medium"
            >
              <option value="All">All Departments</option>
              {categories.filter(c => c !== 'All Departments').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-1 text-gray-500 pointer-events-none" />
          </div>

          <input 
            type="text" 
            placeholder="Search Project Apex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 h-full px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />

          <button 
            type="button"
            className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] h-full px-4 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-[#131921] stroke-[2.5]" />
          </button>
        </div>

        {/* Right Section / Nav Links */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Account & Lists */}
          <div 
            className="relative hidden sm:block"
            onMouseEnter={() => setShowAccountMenu(true)}
            onMouseLeave={() => setShowAccountMenu(false)}
          >
            <Link 
              href={session?.user ? "/account" : "/login"} 
              className="flex flex-col p-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight text-xs"
            >
              <span className="text-gray-300 text-[11px] truncate max-w-[120px]">
                {session?.user ? `Hello, ${session.user.name.split(' ')[0]}` : 'Hello, sign in'}
              </span>
              <span className="font-bold flex items-center gap-0.5">
                Account & Lists <ChevronDown className="w-3 h-3 text-gray-400" />
              </span>
            </Link>

            {/* Account Dropdown Menu */}
            {showAccountMenu && (
              <div className="absolute right-0 top-full pt-1 z-50 w-64 select-none">
                <div className="bg-white rounded-md shadow-2xl border border-gray-300 text-gray-900 p-4 text-xs space-y-3">
                  {!session?.user ? (
                    <div className="text-center pb-3 border-b border-gray-200">
                      <Link
                        href="/login"
                        className="inline-block w-full py-2 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold rounded-full text-center shadow-xs border border-[#fcd34d]"
                      >
                        Sign in
                      </Link>
                      <p className="text-[11px] text-gray-600 mt-2">
                        New customer?{' '}
                        <Link href="/register" className="text-[#007185] font-semibold hover:underline">
                          Start here.
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <div className="pb-2 border-b border-gray-100">
                      <p className="font-bold text-gray-900">{session.user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{session.user.email}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-gray-900 mb-1.5">Your Account</h3>
                    <ul className="space-y-1.5 text-gray-700">
                      <li>
                        <Link href="/account" className="hover:text-[#007185] hover:underline block">
                          Your Account Overview
                        </Link>
                      </li>
                      <li>
                        <Link href="/account/orders" className="hover:text-[#007185] hover:underline block">
                          Your Orders
                        </Link>
                      </li>
                      <li>
                        <Link href="/account/addresses" className="hover:text-[#007185] hover:underline block">
                          Your Addresses
                        </Link>
                      </li>
                      <li>
                        <Link href="/account/security" className="hover:text-[#007185] hover:underline block">
                          Login & Security
                        </Link>
                      </li>
                      <li>
                        <Link href="/account/profile" className="hover:text-[#007185] hover:underline block">
                          Your Profile
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {session?.user && (
                    <div className="pt-2 border-t border-gray-200">
                      <button
                        onClick={async () => {
                          await signOut();
                          router.push('/');
                          router.refresh();
                        }}
                        className="text-red-700 hover:underline font-semibold block text-left w-full cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Returns & Orders */}
          <Link 
            href={session?.user ? "/account/orders" : "/login?callbackUrl=/account/orders"} 
            className="hidden md:flex flex-col p-1.5 border border-transparent hover:border-white rounded cursor-pointer leading-tight text-xs"
          >
            <span className="text-gray-300 text-[11px]">Returns</span>
            <span className="font-bold">& Orders</span>
          </Link>

          {/* Cart */}
          <button 
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 p-1.5 border border-transparent hover:border-white rounded cursor-pointer transition-colors relative"
            aria-label="Open Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-7 h-7 text-white" />
              <span className="absolute -top-1 -right-1 bg-[#f08804] text-[#131921] text-xs font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#131921]">
                {mounted ? totalItems : 0}
              </span>
            </div>
            <span className="hidden sm:inline-block font-bold text-xs self-end mb-1">
              Cart
            </span>
          </button>
        </div>
      </div>

      {/* Sub Header Navigation Bar */}
      <div className="bg-[#232f3e] px-4 py-1.5 flex items-center gap-4 text-xs font-medium overflow-x-auto no-scrollbar whitespace-nowrap">
        <button className="flex items-center gap-1 p-1 border border-transparent hover:border-white rounded cursor-pointer font-bold">
          <Menu className="w-4 h-4" />
          <span>All</span>
        </button>

        <Link href="#deals" className="p-1 border border-transparent hover:border-white rounded cursor-pointer flex items-center gap-1 text-[#febd69]">
          <Sparkles className="w-3.5 h-3.5" />
          Today's Deals
        </Link>
        <Link href="#prime" className="p-1 border border-transparent hover:border-white rounded cursor-pointer">
          Customer Service
        </Link>
        <Link href="#registry" className="p-1 border border-transparent hover:border-white rounded cursor-pointer">
          Registry
        </Link>
        <Link href="#gift-cards" className="p-1 border border-transparent hover:border-white rounded cursor-pointer">
          Gift Cards
        </Link>
        <Link href="#sell" className="p-1 border border-transparent hover:border-white rounded cursor-pointer">
          Sell
        </Link>
        <Link href="#electronics" className="p-1 border border-transparent hover:border-white rounded cursor-pointer hidden sm:inline-block">
          Electronics
        </Link>
        <Link href="#home" className="p-1 border border-transparent hover:border-white rounded cursor-pointer hidden md:inline-block">
          Home & Kitchen
        </Link>
      </div>
    </header>
  );
}
