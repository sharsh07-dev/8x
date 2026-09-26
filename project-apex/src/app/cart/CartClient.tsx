'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  ArrowRight, 
  ShoppingCart,
  Bookmark,
  Share2,
  Lock
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';

export default function CartClient({ recommendedProducts }: { recommendedProducts: Product[] }) {
  const [mounted, setMounted] = useState(false);
  const [savedForLater, setSavedForLater] = useState<any[]>([]);
  const [isGift, setIsGift] = useState(false);

  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    getSubtotal, 
    getTotalItems,
    addToCart
  } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08804]" />
      </div>
    );
  }

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();
  const freeShippingThreshold = 35;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleSaveForLater = (productId: string) => {
    const itemToSave = items.find(item => item.product.id === productId);
    if (itemToSave) {
      setSavedForLater(prev => [...prev, itemToSave]);
      removeFromCart(productId);
    }
  };

  const handleMoveToCart = (item: any) => {
    addToCart(item.product, item.quantity, false);
    setSavedForLater(prev => prev.filter(i => i.product.id !== item.product.id));
  };

  return (
    <div className="min-h-screen bg-[#eaeded] py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xs border border-gray-200 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Apex Cart is empty</h1>
              <p className="text-sm text-gray-600 max-w-lg">
                Your shopping cart is waiting. Give it purpose — fill it with electronics, computers, books, and household essentials.
              </p>
              <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link
                  href="/"
                  className="bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold text-xs sm:text-sm py-2.5 px-6 rounded-full shadow-sm transition-all"
                >
                  Shop today's deals
                </Link>
                <Link
                  href="/"
                  className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-semibold text-xs sm:text-sm py-2.5 px-6 rounded-full transition-all"
                >
                  Explore best sellers
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Active Cart Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Items Column (8 cols) */}
            <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-lg shadow-xs border border-gray-200">
              {/* Header */}
              <div className="border-b border-gray-200 pb-4 flex items-end justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Shopping Cart
                  </h1>
                  <button 
                    onClick={clearCart}
                    className="text-xs text-[#007185] hover:text-[#c7511f] hover:underline cursor-pointer mt-1"
                  >
                    Deselect / Remove all items
                  </button>
                </div>
                <span className="text-xs font-medium text-gray-500 hidden sm:block">
                  Price
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-200">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="py-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gray-50 rounded border border-gray-200 shrink-0 p-2 flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="w-full h-full object-contain mix-blend-multiply" 
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-3">
                          <h2 className="text-base font-medium text-gray-900 hover:text-[#007185] cursor-pointer transition-colors leading-snug">
                            {product.title}
                          </h2>
                          <div className="text-right shrink-0">
                            <span className="text-lg font-bold text-gray-900 block">
                              ₹{(product.price * quantity).toFixed(2)}
                            </span>
                            {quantity > 1 && (
                              <span className="text-[11px] text-gray-500">
                                (₹{product.price.toFixed(2)} each)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stock & Prime */}
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs font-semibold text-emerald-700">In Stock</p>
                          {product.isPrime && (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="font-extrabold italic text-[#00a8e1] text-xs">prime</span>
                              <span className="text-gray-500 text-[11px]">FREE One-Day Delivery</span>
                            </div>
                          )}
                          <p className="text-[11px] text-gray-500">Eligible for FREE Shipping & FREE Returns</p>
                        </div>

                        {/* Gift checkbox */}
                        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            className="rounded text-[#f08804] focus:ring-[#f08804] w-3.5 h-3.5" 
                          />
                          <span className="text-xs text-gray-700">This is a gift</span>
                        </label>
                      </div>

                      {/* Controls Bar */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pt-2 text-xs">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-gray-300 rounded-md bg-white shadow-2xs">
                          <button 
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 py-1 font-bold text-gray-900 bg-gray-50 text-xs border-x border-gray-300">
                            {quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="h-4 w-px bg-gray-300 hidden sm:block" />

                        {/* Action links */}
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className="text-[#007185] hover:underline hover:text-[#c7511f] flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>Delete</span>
                        </button>

                        <button 
                          onClick={() => handleSaveForLater(product.id)}
                          className="text-[#007185] hover:underline hover:text-[#c7511f] flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Bookmark className="w-3.5 h-3.5 text-gray-400" />
                          <span>Save for later</span>
                        </button>

                        <button 
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(window.location.href);
                              alert('Product link copied to clipboard!');
                            }
                          }}
                          className="text-[#007185] hover:underline hover:text-[#c7511f] flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Share2 className="w-3.5 h-3.5 text-gray-400" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Subtotal */}
              <div className="border-t border-gray-200 pt-4 flex justify-end">
                <p className="text-base sm:text-lg text-gray-900">
                  Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'}):{' '}
                  <span className="font-bold text-xl">₹{subtotal.toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Right Summary Column (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Checkout Card */}
              <div className="bg-white p-6 rounded-lg shadow-xs border border-gray-200 space-y-4">
                {/* Free delivery indicator */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${isFreeShipping ? 'text-emerald-600' : 'text-[#f08804]'}`} />
                    <span className="text-xs text-gray-800 leading-tight">
                      {isFreeShipping ? (
                        <span className="font-semibold text-emerald-800">
                          Your order qualifies for FREE Delivery!
                        </span>
                      ) : (
                        <span>
                          Add <strong className="text-red-700">₹{amountToFreeShipping.toFixed(2)}</strong> of eligible items to get FREE Delivery.
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-base text-gray-800">
                    Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'}):{' '}
                    <span className="font-bold text-xl text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </p>
                </div>

                {/* Gift Option */}
                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isGift}
                    onChange={(e) => setIsGift(e.target.checked)}
                    className="rounded text-[#f08804] focus:ring-[#f08804] w-4 h-4" 
                  />
                  <span>This order contains a gift</span>
                </label>

                {/* Proceed to Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full py-3 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-bold text-sm rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center cursor-pointer active:scale-[0.99]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Proceed to checkout</span>
                </Link>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Apex 100% Buyer Protection Guaranteed</span>
                  </p>
                </div>
              </div>

              {/* Prime Upsell / Perks Card */}
              <div className="bg-white p-5 rounded-lg shadow-xs border border-gray-200">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <span className="text-[#00a8e1] font-black italic">prime</span> Member Perks
                </h3>
                <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                  <li>Unlimited free One-Day & Two-Day shipping</li>
                  <li>Exclusive early access to lightning deals</li>
                  <li>Hassle-free package returns & drop-offs</li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* Saved for Later Section */}
        {savedForLater.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-xs border border-gray-200 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              Saved for later ({savedForLater.length} {savedForLater.length === 1 ? 'item' : 'items'})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedForLater.map((item) => (
                <div key={item.product.id} className="border border-gray-200 rounded p-4 flex flex-col justify-between">
                  <div>
                    <img 
                      src={item.product.image} 
                      alt={item.product.title} 
                      className="w-full h-32 object-contain mix-blend-multiply mb-2" 
                    />
                    <h3 className="text-xs font-medium text-gray-900 line-clamp-2">
                      {item.product.title}
                    </h3>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      ₹{item.product.price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMoveToCart(item)}
                    className="mt-3 w-full py-1.5 px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-full text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
                  >
                    Move to cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Products Carousel / Row */}
        <div className="bg-white p-5 rounded-lg shadow-xs border border-gray-200 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">
            Customers who bought items in your cart also bought
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
