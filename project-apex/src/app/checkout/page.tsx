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
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>('SIMULATED_CARD');
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

    // Special handling for Razorpay Test / Live Mode
    if (paymentProvider === 'RAZORPAY') {
      try {
        const createRes = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
            deliveryOptionId: selectedDeliveryId,
            addressId: selectedAddress.id,
          }),
        });

        const orderData = await createRes.json();
        if (!createRes.ok) {
          throw new Error(orderData.error || 'Failed to initiate Razorpay checkout');
        }

        // Check if Razorpay JS SDK is ready on the client window
        if (typeof window !== 'undefined' && (window as any).Razorpay && !orderData.razorpayOrderId.startsWith('order_test_')) {
          const rzp = new (window as any).Razorpay({
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Project Apex',
            description: `Order ${orderData.orderNumber}`,
            order_id: orderData.razorpayOrderId,
            handler: async function (response: any) {
              const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: orderData.orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok) {
                clearCart();
                router.push(`/orders/confirmation/${orderData.orderNumber}`);
              } else {
                setSubmitError(verifyData.error || 'Razorpay payment verification failed');
                setIsSubmitting(false);
              }
            },
            prefill: {
              name: session?.user?.name || '',
              email: session?.user?.email || '',
            },
            theme: { color: '#131921' },
            modal: {
              ondismiss: function () {
                setIsSubmitting(false);
              },
            },
          });
          rzp.open();
        } else {
          // Automated / sandbox verified test flow
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderData.orderId,
              razorpayOrderId: orderData.razorpayOrderId,
              razorpayPaymentId: `rzp_test_pay_${Date.now()}`,
              razorpaySignature: 'sig_test_simulated_success',
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            clearCart();
            router.push(`/orders/confirmation/${orderData.orderNumber}`);
          } else {
            setSubmitError(verifyData.error || 'Payment verification failed');
            setIsSubmitting(false);
          }
        }
        return;
      } catch (rzpErr: any) {
        setSubmitError(rzpErr.message || 'Razorpay checkout error');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        idempotencyKey,
        addressId: selectedAddress.id,
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

      // Clear the local Zustand shopping cart
      clearCart();

      // Redirect to confirmation page
      router.push(`/orders/confirmation/${data.order.orderNumber}`);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong while placing your order.');
      setIsSubmitting(false);
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
      {/* Checkout Minimal Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between border-b pb-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              apex<span className="text-amber-500">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-slate-700 text-base font-semibold">
            <Lock className="w-5 h-5 text-gray-500" />
            <span>Checkout ({items.reduce((a, b) => a + b.quantity, 0)} {items.reduce((a, b) => a + b.quantity, 0) === 1 ? 'item' : 'items'})</span>
          </div>
          <Link href="/cart" className="text-xs text-cyan-700 hover:underline font-medium">
            Return to Cart
          </Link>
        </div>
      </div>

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
