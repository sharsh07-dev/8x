import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { calculateOrderPricing, DELIVERY_OPTIONS } from '@/lib/checkout/pricing';
import { checkInventoryAvailability } from '@/lib/checkout/inventory';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { MockPaymentAdapter, PaymentMethodType } from '@/lib/payments/payment-adapter';

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Fetch only orders belonging to the authenticated user
  try {
    const { prisma } = await import('@/lib/prisma');
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: true,
        addressSnapshot: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders });
  } catch (dbErr: any) {
    console.warn('[orders GET] DB unavailable:', dbErr?.message);
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required to place an order' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      idempotencyKey,
      addressId,
      deliveryOptionId = 'FREE_STANDARD',
      paymentProvider = 'SIMULATED_CARD',
      items,
      promoCode,
      paymentDetails,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    if (!addressId) {
      return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 });
    }

    // 1. Load prisma dynamically (fails gracefully if DB is down)
    const { prisma } = await import('@/lib/prisma');

    // 2. Check idempotency record to prevent duplicate submissions
    if (idempotencyKey) {
      const existingRecord = await prisma.idempotencyRecord.findUnique({
        where: { key: idempotencyKey },
      });

      if (existingRecord) {
        // Return existing order safely
        const existingOrder = await prisma.order.findUnique({
          where: { id: existingRecord.orderId },
          include: {
            items: true,
            addressSnapshot: true,
            payment: true,
          },
        });

        if (existingOrder) {
          return NextResponse.json({
            success: true,
            order: existingOrder,
            idempotentReplay: true,
          });
        }
      }
    }

    // 3. Verify selected address exists and belongs to the authenticated user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Selected delivery address not found or not owned by user' },
        { status: 403 }
      );
    }

    // 3. Verify stock availability
    const inventoryCheck = await checkInventoryAvailability(items);
    if (!inventoryCheck.valid) {
      return NextResponse.json({ error: inventoryCheck.reason }, { status: 400 });
    }

    // 4. Server authoritative price calculation
    const pricingResult = calculateOrderPricing(items, deliveryOptionId, promoCode);
    if (!pricingResult.success) {
      return NextResponse.json({ error: pricingResult.error }, { status: 400 });
    }
    const { pricing } = pricingResult;

    // Generate unique order number (e.g., APX-2026-783921)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `APX-2026-${randomSuffix}`;

    // 5. Process payment via configured adapter
    const paymentResult = await MockPaymentAdapter.processPayment({
      orderId: 'pending',
      orderNumber,
      amount: pricing.total,
      currency: pricing.currency,
      provider: paymentProvider as PaymentMethodType,
      cardName: paymentDetails?.cardName,
      cardLast4: paymentDetails?.cardLast4 || (paymentProvider === 'SIMULATED_CARD' ? '4242' : undefined),
      cardBrand: paymentDetails?.cardBrand || (paymentProvider === 'SIMULATED_CARD' ? 'Visa' : undefined),
      simulateFailure: paymentDetails?.simulateFailure || paymentDetails?.cardLast4 === '0000',
    });

    if (!paymentResult.success && paymentResult.status === 'FAILED') {
      return NextResponse.json(
        { error: paymentResult.errorMessage || 'Simulated payment was declined' },
        { status: 402 }
      );
    }

    // 7. Execute transactional database operations
    const newOrder = await prisma.$transaction(async (tx) => {
      // Concurrency-safe inventory decrement
      for (const item of pricing.items) {
        const inv = await tx.productInventory.findUnique({
          where: { productId: item.productId },
        });

        if (!inv || inv.stock < item.quantity) {
          throw new Error(`Insufficient stock remaining for ${item.productTitle}`);
        }

        await tx.productInventory.update({
          where: { productId: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Determine initial order & payment status
      const paymentStatus = paymentResult.status;
      const orderStatus = 'CONFIRMED';

      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          status: orderStatus,
          paymentStatus,
          currency: pricing.currency,
          subtotal: pricing.subtotal,
          shipping: pricing.shipping,
          tax: pricing.tax,
          discount: pricing.discount,
          total: pricing.total,
          deliveryMethod: pricing.deliveryOption.name,
          estimatedDelivery: pricing.deliveryOption.estimatedDelivery,
          items: {
            create: pricing.items.map((i) => ({
              productId: i.productId,
              productTitle: i.productTitle,
              productImage: i.productImage,
              unitPrice: i.unitPrice,
              quantity: i.quantity,
              lineTotal: i.lineTotal,
            })),
          },
          addressSnapshot: {
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
          },
          payment: {
            create: {
              provider: paymentProvider,
              providerReference: paymentResult.providerReference,
              amount: pricing.total,
              currency: pricing.currency,
              status: paymentStatus,
              cardLast4: paymentDetails?.cardLast4 || (paymentProvider === 'SIMULATED_CARD' ? '4242' : null),
              cardBrand: paymentDetails?.cardBrand || (paymentProvider === 'SIMULATED_CARD' ? 'Visa' : null),
            },
          },
        },
        include: {
          items: true,
          addressSnapshot: true,
          payment: true,
        },
      });

      // Record idempotency key if provided
      if (idempotencyKey) {
        await tx.idempotencyRecord.create({
          data: {
            key: idempotencyKey,
            userId: session.user.id,
            orderId: createdOrder.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry
          },
        });
      }

      return createdOrder;
    });

    // 6. Send transactional order confirmation email
    try {
      sendOrderConfirmationEmail(
        session.user.email,
        session.user.name,
        newOrder.orderNumber,
        newOrder.total,
        newOrder.estimatedDelivery,
        newOrder.items.map((i) => ({
          title: i.productTitle,
          quantity: i.quantity,
          price: i.unitPrice,
        }))
      ).catch((err) => console.error('Error sending order confirmation email:', err));
    } catch (emailErr) {
      console.error('Email trigger error:', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Failed to create order:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to place order due to a server error' },
      { status: 500 }
    );
  }
}
