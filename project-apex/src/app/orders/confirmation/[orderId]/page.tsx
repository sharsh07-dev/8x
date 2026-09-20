'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from '@/lib/auth-client';
import {
  CheckCircle,
  Truck,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
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

export default function OrderConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push(`/login?callbackUrl=/orders/confirmation/${params.orderId}`);
      return;
    }

    if (!session?.user || !params.orderId) return;

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.orderId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load order confirmation.');
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

  if (sessionLoading || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-9 h-9 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold text-gray-700">Loading order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found or Access Denied</h1>
        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
          {error || "We couldn't retrieve the details for this order. It may belong to another user account."}
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/account/orders"
            className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm transition"
          >
            Go to Your Orders
          </Link>
          <Link
            href="/"
            className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900">Order Placed, Thanks!</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  Confirmation sent to <strong className="text-gray-900">{session?.user?.email}</strong>
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold block">Order Number</span>
              <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded">
                {order.orderNumber}
              </span>
            </div>
          </div>

          {/* Delivery Promise Highlight */}
          <div className="mt-6 bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Truck className="w-6 h-6 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wide">
                  Estimated Delivery Window
                </p>
                <p className="text-base font-bold text-emerald-950">
                  {order.estimatedDelivery}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-white/80 border border-emerald-300 px-3 py-1 rounded-full self-start sm:self-auto">
              {order.deliveryMethod}
            </span>
          </div>

          {/* Key order specs grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 pt-2">
            <div className="border border-gray-100 rounded-lg p-3.5 bg-gray-50/50">
              <div className="flex items-center gap-2 font-bold text-gray-800 mb-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>Shipping Address</span>
              </div>
              {order.addressSnapshot && (
                <div className="space-y-0.5 pl-6 text-gray-600">
                  <p className="font-semibold text-gray-900">{order.addressSnapshot.fullName}</p>
                  <p>{order.addressSnapshot.street}</p>
                  <p>{order.addressSnapshot.city}, {order.addressSnapshot.state} {order.addressSnapshot.zipCode}</p>
                </div>
              )}
            </div>

            <div className="border border-gray-100 rounded-lg p-3.5 bg-gray-50/50">
              <div className="flex items-center gap-2 font-bold text-gray-800 mb-1">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span>Payment Method</span>
              </div>
              <div className="space-y-0.5 pl-6 text-gray-600">
                <p className="font-semibold text-gray-900">
                  {order.payment?.provider === 'SIMULATED_CARD'
                    ? `Visa ending in ${order.payment.cardLast4 || '4242'}`
                    : order.payment?.provider === 'CASH_ON_DELIVERY'
                    ? 'Cash on Delivery (COD)'
                    : 'Apex Rewards Points'}
                </p>
                <p className="text-[11px] text-amber-700 font-medium">Sandbox Mode (Simulated)</p>
                <p className="text-[11px] text-emerald-700 font-bold uppercase">Status: {order.paymentStatus}</p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg p-3.5 bg-gray-50/50">
              <div className="flex items-center gap-2 font-bold text-gray-800 mb-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Order Summary</span>
              </div>
              <div className="space-y-1 pl-6 text-gray-600">
                <p className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-medium text-gray-900">${order.subtotal.toFixed(2)}</span>
                </p>
                <p className="flex justify-between">
                  <span>Shipping:</span>
                  <span className={order.shipping === 0 ? 'text-emerald-700 font-bold' : 'text-gray-900 font-medium'}>
                    {order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}
                  </span>
                </p>
                <p className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Grand Total:</span>
                  <span className="text-amber-700 font-extrabold">${order.total.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-700" />
            Items in this Shipment ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
          </h2>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center">
                <div className="w-20 h-20 relative bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                  <Image
                    src={item.productImage}
                    alt={item.productTitle}
                    fill
                    className="object-contain p-1.5"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.productId}`}
                    className="text-sm font-semibold text-gray-900 hover:text-amber-600 transition truncate block"
                  >
                    {item.productTitle}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span>Quantity: <strong className="text-gray-800">{item.quantity}</strong></span>
                    <span>Unit Price: <strong className="text-gray-800">${item.unitPrice.toFixed(2)}</strong></span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-bold text-gray-900">
                    ${item.lineTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Need assistance with this order? Visit our Customer Service hub anytime.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href={`/account/orders/${order.orderNumber}`}
              className="w-full sm:w-auto text-center border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold px-5 py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-1.5"
            >
              Manage Order <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto text-center bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
