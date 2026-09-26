'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useCartStore } from '@/store/useCartStore';
import { Address, AddressSelector } from '@/components/checkout/AddressSelector';
import { DeliveryOptions } from '@/components/checkout/DeliveryOptions';
import { PaymentMethodSelector, PaymentProvider } from '@/components/checkout/PaymentMethodSelector';
import { OrderReview } from '@/components/checkout/OrderReview';
import { OrderSummarySidebar } from '@/components/checkout/OrderSummarySidebar';
import { DeliveryOption, PricingCalculationResult, DELIVERY_OPTIONS } from '@/lib/checkout/pricing';
import { ShoppingBag, ArrowLeft, Loader2, Lock } from 'lucide-react';
import Script from 'next/script';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const { items, clearCart } = useCartStore();

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(Object.values(DELIVERY_OPTIONS));
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>('FREE_STANDARD');
  
  // Payment states
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('RAZORPAY');
  const [cardName, setCardName] = useState('Alex Morgan (Test)');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');

  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | undefined>(undefined);
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Authoritative server pricing preview
  const [pricing, setPricing] = useState<PricingCalculationResult | null>(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  
  // Order submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');

  // 1. Auth check & redirect if unauthenticated
  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push('/login?callbackUrl=/checkout');
    }
  }, [session, sessionLoading, router]);

  // 2. Generate idempotency key on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const key = `apex_idem_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      setIdempotencyKey(key);
    }
  }, []);

  // 3. Load user checkout data (saved addresses)
  useEffect(() => {
    if (!session?.user) return;

    async function loadCheckoutData() {
      try {
        const res = await fetch('/api/checkout');
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login?callbackUrl=/checkout');
            return;
          }
          throw new Error('Failed to load checkout settings');
        }
        const data = await res.json();
        setAddresses(data.addresses || []);
        if (data.addresses && data.addresses.length > 0) {
          const defaultAddr = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0];
          setSelectedAddress(defaultAddr);
        }
        if (data.deliveryOptions) {
          setDeliveryOptions(data.deliveryOptions);
        }
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoadingInitial(false);
      }
    }

    loadCheckoutData();
  }, [session, router]);

  // 4. Recalculate authoritative server pricing whenever items, delivery, or applied promo changes
  useEffect(() => {
    if (!session?.user || items.length === 0) return;

    let isMounted = true;
    async function updatePricing() {
      setCalculatingPrice(true);
      try {
        const payloadItems = items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        }));

        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: payloadItems,
            deliveryOptionId: selectedDeliveryId,
            promoCode: appliedPromo ? promoCode : undefined,
          }),
        });

        const data = await res.json();
        if (res.ok && isMounted) {
          setPricing(data.pricing);
        }
      } catch (err) {
        console.error('Error calculating pricing:', err);
      } finally {
        if (isMounted) setCalculatingPrice(false);
      }
    }

    updatePricing();
    return () => {
      isMounted = false;
    };
  }, [items, selectedDeliveryId, appliedPromo, session]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    setSubmitError('');

    try {
      const payloadItems = items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }));

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payloadItems,
          deliveryOptionId: selectedDeliveryId,
          promoCode: promoCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid promo code');
      }

      setPricing(data.pricing);
      setAppliedPromo(data.pricing.appliedPromo || promoCode.trim());
    } catch (err: any) {
      setSubmitError(err.message || 'Error applying promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setSubmitError('Please select or add a delivery address to continue.');
      return;
    }

    if (items.length === 0) {
      setSubmitError('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const EXPRESS_API = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

    try {
      let initRes;
      try {
        // Step 1: Initialize order via Express backend (locks inventory in Postgres)
        initRes = await fetch(`${EXPRESS_API}/orders/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            addressId: selectedAddress.id,
            deliveryOptionId: selectedDeliveryId
          }),
        });
      } catch (networkError) {
        // Fallback to legacy Next.js API route if Express backend isn't reachable (Network Error)
        return handlePlaceOrderLegacy();
      }

      if (!initRes.ok) {
        // Fallback to legacy Next.js API route on 502/503/404
        if (initRes.status === 502 || initRes.status === 503 || initRes.status === 404) {
          return handlePlaceOrderLegacy();
        }
        const errData = await initRes.json().catch(() => ({}));
        throw new Error(errData.error?.message || errData.message || 'Failed to initialize order');
      }

      const { data: { order: pendingOrder } } = await initRes.json();

      // Step 2: Payment
      if (paymentProvider === 'RAZORPAY' || paymentProvider === 'RAZORPAY_UPI') {
        // Razorpay: Create Razorpay order linked to our pending order
        const rzpCreateRes = await fetch(`${EXPRESS_API}/payments/razorpay/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ orderId: pendingOrder.id }),
        });

        const rzpData = await rzpCreateRes.json();
        if (!rzpCreateRes.ok) {
          throw new Error(rzpData.error?.message || 'Failed to initiate Razorpay checkout');
        }

        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          const rzpOptions: any = {
            key: rzpData.data.keyId,
            amount: rzpData.data.amount,
            currency: rzpData.data.currency || 'INR',
            name: 'Project Apex',
            description: `Order ${rzpData.data.orderNumber}`,
            order_id: rzpData.data.razorpayOrderId,
            handler: async function (response: any) {
              const verifyRes = await fetch(`${EXPRESS_API}/payments/razorpay/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  orderId: pendingOrder.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok) {
                await clearCart();
                router.push(`/orders/confirmation/${pendingOrder.orderNumber}`);
              } else {
                setSubmitError(verifyData.error?.message || 'Payment verification failed');
                setIsSubmitting(false);
              }
            },
            prefill: {
              name: session?.user?.name || '',
              email: session?.user?.email || '',
              contact: selectedAddress?.phone || '9876543210',
              method: paymentProvider === 'RAZORPAY_UPI' ? 'upi' : undefined,
            },
            theme: { color: '#131921' },
            modal: {
              ondismiss: function () {
                setIsSubmitting(false);
              },
            },
          };
          const rzp = new (window as any).Razorpay(rzpOptions);
          rzp.open();
        } else {
          // Sandbox/simulated flow
          const verifyRes = await fetch(`${EXPRESS_API}/payments/razorpay/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              orderId: pendingOrder.id,
              razorpayOrderId: rzpData.data.razorpayOrderId,
              razorpayPaymentId: `rzp_test_pay_${Date.now()}`,
              razorpaySignature: 'sig_test_simulated_success',
            }),
          });
          if (verifyRes.ok) {
            await clearCart();
            router.push(`/orders/confirmation/${pendingOrder.orderNumber}`);
          } else {
            const verifyData = await verifyRes.json();
            throw new Error(verifyData.error?.message || 'Payment verification failed');
          }
        }
        return;
      }

      // Simulated card / COD / Apex Points
      const payRes = await fetch(`${EXPRESS_API}/payments/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId: pendingOrder.id,
          provider: paymentProvider,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error?.message || 'Payment failed');
      }

      await clearCart();
      router.push(`/orders/confirmation/${pendingOrder.orderNumber}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong while placing your order.');
      setIsSubmitting(false);
    }
  };

  // Legacy fallback: uses Next.js API route (original flow, no inventory locking)
  const completeLegacyOrder = async () => {
    try {
      const payload = {
        idempotencyKey,
        addressId: selectedAddress!.id,
        deliveryOptionId: selectedDeliveryId,
        paymentProvider,
        promoCode: appliedPromo ? promoCode : undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        paymentDetails: {
          cardName: paymentProvider === 'SIMULATED_CARD' ? cardName : undefined,
          cardLast4: paymentProvider === 'SIMULATED_CARD' ? '4242' : undefined,
          cardBrand: paymentProvider === 'SIMULATED_CARD' ? 'Visa' : undefined,
        },
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place your order. Please try again.');
      }

      await clearCart();
      router.push(`/orders/confirmation/${data.order.orderNumber}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong while placing your order.');
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrderLegacy = async () => {
    if ((paymentProvider === 'RAZORPAY' || paymentProvider === 'RAZORPAY_UPI') && typeof window !== 'undefined' && (window as any).Razorpay) {
      // Mock Razorpay Modal for frontend-only fallback
      const rzpOptions: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Use real test key if available
        amount: Math.round((pricing?.total || 0) * 100),
        currency: 'INR',
        name: 'PEHNO',
        description: 'Order Payment',
        prefill: {
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          contact: selectedAddress?.phone || '9876543210',
        },
        theme: { color: '#171717' },
        handler: async function (response: any) {
          // Success simulated
          await completeLegacyOrder();
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };
      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.open();
    } else {
      await completeLegacyOrder();
    }
  };


  if (sessionLoading || loadingInitial) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-semibold text-gray-700">Loading your secure checkout...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Shopping Cart is empty</h1>
        <p className="text-sm text-gray-600 mb-6">
          Add items to your cart before proceeding to checkout.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 py-2.5 rounded-lg text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    );
  }

  const selectedDeliveryOption =
    deliveryOptions.find((d) => d.id === selectedDeliveryId) || deliveryOptions[0];

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      {/* Minimal header removed to avoid duplication with global Header */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Checkout Columns (Steps 1 to 4) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Delivery Address */}
            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddress?.id || null}
              onSelectAddress={(addr) => setSelectedAddress(addr)}
              onAddressCreated={(newAddr) => {
                setAddresses((prev) => [newAddr, ...prev]);
                setSelectedAddress(newAddr);
              }}
            />

            {/* Step 2: Delivery Options */}
            <DeliveryOptions
              options={deliveryOptions}
              selectedOptionId={selectedDeliveryId}
              onSelectOption={(id) => setSelectedDeliveryId(id)}
              subtotal={pricing?.subtotal || 0}
            />

            {/* Step 3: Payment Method */}
            <PaymentMethodSelector
              selectedProvider={paymentProvider}
              onSelectProvider={(p) => setPaymentProvider(p)}
              cardName={cardName}
              setCardName={setCardName}
              cardNumber={cardNumber}
              setCardNumber={setCardNumber}
              expiry={expiry}
              setExpiry={setExpiry}
            />

            {/* Step 4: Order Review & Items */}
            {pricing && (
              <OrderReview
                items={pricing.items}
                address={selectedAddress}
                deliveryOption={selectedDeliveryOption}
                paymentProvider={paymentProvider}
                promoCode={promoCode}
                setPromoCode={setPromoCode}
                onApplyPromo={handleApplyPromo}
                appliedPromo={appliedPromo}
                applyingPromo={applyingPromo}
              />
            )}
          </div>

          {/* Sticky Right Sidebar (Order Summary) */}
          <div className="lg:col-span-4">
            {pricing ? (
              <OrderSummarySidebar
                pricing={pricing}
                isSubmitting={isSubmitting}
                onPlaceOrder={handlePlaceOrder}
                canPlaceOrder={!!selectedAddress && items.length > 0}
                errorMessage={submitError}
              />
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm flex items-center justify-center min-h-[250px]">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Razorpay Standard Checkout Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
    </div>
  );
}
