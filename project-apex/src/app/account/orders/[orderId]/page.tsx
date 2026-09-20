'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from '@/lib/auth-client';
import { useCartStore } from '@/store/useCartStore';
import { mockProducts } from '@/data/mockProducts';
import {
  ChevronRight,
  Package,
  Truck,
  MapPin,
  CreditCard,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertTriangle,
  Loader2,
  XCircle,
  FileText,
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
  country: string;
  phone?: string | null;
  instructions?: string | null;
}

interface Payment {
  provider: string;
  providerReference: string;
  amount: number;
  status: string;
  cardLast4?: string | null;
  cardBrand?: string | null;
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
  payment?: Payment;
}

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const { addToCart } = useCartStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [addedItemMessage, setAddedItemMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push(`/login?callbackUrl=/account/orders/${params.orderId}`);
      return;
    }

    if (!session?.user || !params.orderId) return;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.orderId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load order.');
          return;
        }

        setOrder(data.order);
      } catch (err: any) {
        setError(err.message || 'Network error fetching order');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [session, sessionLoading, params.orderId, router]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm('Are you sure you want to cancel this order? Items will be returned to inventory.')) {
      return;
    }

    setCancelling(true);
    setCancelError('');

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel order');
      }

      setOrder(data.order);
    } catch (err: any) {
      setCancelError(err.message || 'Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  const handleBuyAgain = (item: OrderItem) => {
    const prod = mockProducts.find((p) => p.id === item.productId);
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
    setAddedItemMessage(`Added "${item.productTitle.slice(0, 30)}..." to your cart!`);
    setTimeout(() => setAddedItemMessage(null), 3500);
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold text-gray-700">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Available</h1>
        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
          {error || 'This order could not be found or you do not have permission to view it.'}
        </p>
        <Link
          href="/account/orders"
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition"
        >
          Return to Your Orders
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <Link href="/account" className="text-cyan-700 hover:underline">
            Your Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/account/orders" className="text-cyan-700 hover:underline">
            Your Orders
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-medium">Order Details</span>
        </nav>

        {addedItemMessage && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {addedItemMessage}
          </div>
        )}

        {cancelError && (
          <div className="mb-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold px-4 py-2.5 rounded-lg">
            {cancelError}
          </div>
        )}

        {/* Order Header Meta */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Order Details</h1>
              <p className="text-xs text-gray-500 mt-1">
                Ordered on {orderDate} • Order # <span className="font-mono font-bold text-gray-800">{order.orderNumber}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isCancelled
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isCancelled ? 'Cancelled' : `Status: ${order.status}`}
              </span>
            </div>
          </div>

          {/* Fulfillment Tracker */}
          <div className="mt-6 pt-2 pb-4">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
              Fulfillment Status
            </h3>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-900 block">Ordered</span>
                <span className="text-[11px] text-gray-500">{orderDate}</span>
              </div>
              <div className="space-y-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    isCancelled
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-900 block">Confirmed</span>
                <span className="text-[11px] text-gray-500">Inventory secured</span>
              </div>
              <div className="space-y-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${
                    isCancelled
                      ? 'bg-gray-200 text-gray-400'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-900 block">Out for Delivery</span>
                <span className="text-[11px] text-gray-500">{order.estimatedDelivery}</span>
              </div>
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-gray-400 block">Delivered</span>
                <span className="text-[11px] text-gray-400">Doorstep</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Snapshots */}
          <div className="mt-4 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                <MapPin className="w-4 h-4 text-gray-500" /> Shipping Address
              </h4>
              {order.addressSnapshot && (
                <div className="text-gray-600 space-y-0.5">
                  <p className="font-semibold text-gray-800">{order.addressSnapshot.fullName}</p>
                  <p>{order.addressSnapshot.street}</p>
                  <p>{order.addressSnapshot.city}, {order.addressSnapshot.state} {order.addressSnapshot.zipCode}</p>
                  <p>{order.addressSnapshot.country}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                <CreditCard className="w-4 h-4 text-gray-500" /> Payment Method
              </h4>
              <div className="text-gray-600 space-y-0.5">
                <p className="font-semibold text-gray-800">
                  {order.payment?.provider === 'SIMULATED_CARD'
                    ? `Visa ending in ${order.payment.cardLast4 || '4242'}`
                    : order.payment?.provider === 'CASH_ON_DELIVERY'
                    ? 'Cash on Delivery (COD)'
                    : 'Apex Rewards Points'}
                </p>
                <p className="text-amber-700">Sandbox Simulated Mode</p>
                <p className="font-bold uppercase text-emerald-700">
                  Payment: {order.paymentStatus}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4 text-gray-500" /> Order Summary
              </h4>
              <div className="space-y-1 text-gray-600">
                <p className="flex justify-between">
                  <span>Item(s) Subtotal:</span>
                  <span className="font-medium text-gray-800">${order.subtotal.toFixed(2)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Shipping &amp; Handling:</span>
                  <span className={order.shipping === 0 ? 'text-emerald-700 font-bold' : 'text-gray-800'}>
                    {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
                  </span>
                </p>
                {order.discount > 0 && (
                  <p className="flex justify-between text-emerald-700">
                    <span>Discount:</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span>Estimated Tax:</span>
                  <span className="text-gray-800">${order.tax.toFixed(2)}</span>
                </p>
                <p className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="text-amber-700 font-extrabold">${order.total.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Items Ordered ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
            {!isCancelled && order.status === 'CONFIRMED' && (
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="text-xs text-rose-700 hover:text-rose-900 font-bold border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded transition disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Cancel this order'}
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-20 h-20 relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                    <Image
                      src={item.productImage}
                      alt={item.productTitle}
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.productId}`}
                      className="text-sm font-semibold text-gray-900 hover:text-amber-600 transition line-clamp-2"
                    >
                      {item.productTitle}
                    </Link>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span>Qty: <strong className="text-gray-800">{item.quantity}</strong></span>
                      <span>Unit: <strong className="text-gray-800">${item.unitPrice.toFixed(2)}</strong></span>
                      <span className="font-bold text-gray-900">Total: ${item.lineTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleBuyAgain(item)}
                    className="flex-1 sm:flex-none bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Buy it again
                  </button>
                  <Link
                    href={`/products/${item.productId}`}
                    className="flex-1 sm:flex-none border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-xs text-center transition"
                  >
                    View item
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
