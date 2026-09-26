'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useCartStore } from '@/store/useCartStore';
import { fetchProductAction } from '@/app/actions/catalog';
import {
  Package,
  ChevronRight,
  Search,
  ShoppingCart,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface OrderAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: string;
  paymentStatus: string;
  currency: string;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  deliveryMethod: string;
  estimatedDelivery: string;
  createdAt: string;
  items: OrderItem[];
  addressSnapshot: OrderAddress;
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const { addToCart } = useCartStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'RECENT' | 'CANCELLED'>('ALL');
  const [cartAlert, setCartAlert] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push('/login?callbackUrl=/account/orders');
      return;
    }

    if (!session?.user) return;

    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        if (!res.ok) {
          throw new Error('Failed to load order history');
        }
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [session, sessionLoading, router]);

  const handleBuyAgain = async (item: OrderItem) => {
    const prod = await fetchProductAction(item.productId);
    if (prod) {
      addToCart(prod, 1, true);
    } else {
      addToCart(
        {
          id: item.productId,
          title: item.productTitle,
          price: item.unitPrice,
          image: item.productImage,
          category: 'All',
          inStock: true,
          stock: 10,
          isPrime: true,
          rating: 4.8,
          reviewCount: 100,
        },
        1,
        true
      );
    }
    setCartAlert(`Added "${item.productTitle.slice(0, 30)}..." to your cart!`);
    setTimeout(() => setCartAlert(null), 3000);
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold text-gray-700">Loading your orders...</p>
      </div>
    );
  }

  // Filter orders based on active tab and search query
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'CANCELLED' && order.status !== 'CANCELLED') return false;
    if (activeTab === 'RECENT') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (new Date(order.createdAt) < thirtyDaysAgo) return false;
    }

    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const matchesOrderNum = order.orderNumber.toLowerCase().includes(query);
    const matchesItem = order.items.some((i) => i.productTitle.toLowerCase().includes(query));
    return matchesOrderNum || matchesItem;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/account" className="text-cyan-700 hover:underline">
            Your Account
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-800 font-medium">Your Orders</span>
        </nav>

        {cartAlert && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {cartAlert}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
          <div className="flex items-center max-w-xs border border-gray-300 rounded-lg bg-white overflow-hidden text-xs shadow-2xs">
            <Search className="w-3.5 h-3.5 text-gray-400 ml-2.5" />
            <input
              type="text"
              placeholder="Search all orders"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-2.5 py-2 outline-none flex-1 text-xs"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex border-b border-gray-200 text-xs font-semibold gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`pb-2.5 cursor-pointer transition ${
              activeTab === 'ALL'
                ? 'text-gray-900 border-b-2 border-amber-500 font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RECENT')}
            className={`pb-2.5 cursor-pointer transition ${
              activeTab === 'RECENT'
                ? 'text-gray-900 border-b-2 border-amber-500 font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Past 30 Days
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CANCELLED')}
            className={`pb-2.5 cursor-pointer transition ${
              activeTab === 'CANCELLED'
                ? 'text-gray-900 border-b-2 border-amber-500 font-bold'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Cancelled Orders ({orders.filter((o) => o.status === 'CANCELLED').length})
          </button>
        </div>

        {/* Empty orders state */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {searchQuery ? 'No matching orders found' : 'No orders found'}
              </h2>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try searching for a different product keyword or order number.'
                  : "You haven't placed any orders yet. Explore our live catalog to discover today's top deals."}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 py-2.5 px-6 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Start shopping</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Order Cards List */
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const isCancelled = order.status === 'CANCELLED';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Card Header (Amazon style) */}
                  <div className="bg-gray-50/80 px-6 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-6 text-gray-600">
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-bold">ORDER PLACED</span>
                        <span className="font-semibold text-gray-900">{formattedDate}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-bold">TOTAL</span>
                        <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-gray-400 uppercase font-bold">SHIP TO</span>
                        <span className="font-semibold text-gray-900">{order.addressSnapshot?.fullName || 'Customer'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] text-gray-400 uppercase font-bold">ORDER # {order.orderNumber}</span>
                      <Link
                        href={`/account/orders/${order.orderNumber}`}
                        className="text-cyan-700 hover:text-amber-600 font-bold inline-flex items-center gap-1"
                      >
                        View order details <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isCancelled
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isCancelled ? 'Cancelled' : `Delivery: ${order.estimatedDelivery}`}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-16 h-16 relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                              <Image
                                src={item.productImage}
                                alt={item.productTitle}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/products/${item.productId}`}
                                className="text-xs font-semibold text-gray-900 hover:text-amber-600 line-clamp-2"
                              >
                                {item.productTitle}
                              </Link>
                              <div className="mt-1 text-[11px] text-gray-500">
                                Qty: {item.quantity} • ${item.unitPrice.toFixed(2)} each
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => handleBuyAgain(item)}
                              className="flex-1 sm:flex-none bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Buy it again
                            </button>
                            <Link
                              href={`/account/orders/${order.orderNumber}`}
                              className="flex-1 sm:flex-none border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-3.5 py-1.5 rounded-lg text-xs text-center transition"
                            >
                              Track package
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
