import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { calculateOrderPricing } from '@/lib/checkout/pricing';
import { checkInventoryAvailability } from '@/lib/checkout/inventory';
import { createRazorpayOrder, getRazorpayPublicKey, isRazorpayConfigured } from '@/lib/payments/razorpay';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, deliveryOptionId, addressId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Shopping cart is empty' },
        { status: 400 }
      );
    }

    // 1. Inventory check
    const inventoryCheck = await checkInventoryAvailability(items);
    if (!inventoryCheck.valid) {
      return NextResponse.json(
        {
          error: inventoryCheck.reason || 'Some items in your cart exceed available stock.',
        },
        { status: 409 }
      );
    }

    // 2. Server-authoritative calculation
    const pricingResult = calculateOrderPricing(
      items.map((it: any) => ({ productId: it.productId, quantity: it.quantity })),
      deliveryOptionId || 'FREE_STANDARD'
    );

    if (!pricingResult.success) {
      return NextResponse.json(
        { error: pricingResult.error },
        { status: 400 }
      );
    }

    const pricing = pricingResult.pricing;

    // 3. Verify delivery address
    const address = addressId
      ? await prisma.address.findUnique({ where: { id: addressId } })
      : await prisma.address.findFirst({ where: { userId: session.user.id } });

    const orderNumber = `APX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Create pending order in database
    const pendingOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        currency: 'USD',
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        tax: pricing.tax,
        discount: pricing.discount,
        total: pricing.total,
        deliveryMethod: deliveryOptionId || 'FREE_STANDARD',
        estimatedDelivery: pricing.deliveryOption?.estimatedDelivery || '2 business days',
        items: {
          create: pricing.items.map((item) => ({
            productId: item.productId,
            productTitle: item.productTitle,
            productImage: item.productImage,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          })),
        },
        addressSnapshot: address
          ? {
              create: {
                fullName: address.fullName,
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                country: address.country,
                phone: address.phone,
                instructions: address.instructions,
              },
            }
          : undefined,
      },
    });

    // 5. Initiate Razorpay order (amount in cents)
    const amountInCents = Math.round(pricing.total * 100);
    const rzpOrder = await createRazorpayOrder({
      amount: amountInCents,
      currency: 'USD',
      receipt: orderNumber,
      notes: {
        orderId: pendingOrder.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      orderId: pendingOrder.id,
      orderNumber: pendingOrder.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: amountInCents,
      currency: 'USD',
      keyId: getRazorpayPublicKey(),
      isConfigured: isRazorpayConfigured(),
      customerName: session.user.name,
      customerEmail: session.user.email,
    });
  } catch (error: any) {
    console.error('Error initiating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Razorpay order: ' + error.message },
      { status: 500 }
    );
  }
}
