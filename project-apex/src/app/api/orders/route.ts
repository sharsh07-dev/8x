import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { calculateOrderPricing, DELIVERY_OPTIONS } from '@/lib/checkout/pricing';
import { checkInventoryAvailability } from '@/lib/checkout/inventory';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { MockPaymentAdapter, PaymentMethodType } from '@/lib/payments/payment-adapter';
import { getUserAddresses, getCookieOrders, saveCookieOrder } from '@/lib/user-storage';

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Try fetching orders from DB
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
    if (orders && orders.length > 0) {
      return NextResponse.json({ orders });
    }
  } catch (dbErr: any) {
    console.warn('[orders GET] DB unavailable:', dbErr?.message);
  }

  // 2. Fallback to cookie storage
  const cookieOrders = await getCookieOrders(session.user.id);
  return NextResponse.json({ orders: cookieOrders });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      items,
      addressId,
      deliveryOptionId,
      paymentProvider,
      paymentDetails,
      promoCode,
      idempotencyKey,
    } = body;

    // Validate request body
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Shopping cart cannot be empty' }, { status: 400 });
    }

    if (!addressId) {
      return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 });
    }

    // 1. Check idempotency record if DB is accessible
    if (idempotencyKey) {
      try {
        const { prisma } = await import('@/lib/prisma');
        const existingRecord = await prisma.idempotencyRecord.findUnique({
          where: { key: idempotencyKey },
        });

        if (existingRecord && existingRecord.userId === session.user.id) {
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
      } catch {}
    }

    // 2. Resolve delivery address (DB or cookie storage)
    const userAddresses = await getUserAddresses(session.user.id);
    let address = userAddresses.find((a) => a.id === addressId);
    if (!address && userAddresses.length > 0) {
      address = userAddresses[0];
    }
    if (!address) {
      address = {
        id: addressId,
        userId: session.user.id,
        fullName: session.user.name || 'Valued Customer',
        street: 'Delivery Address',
        city: 'City',
        state: 'State',
        zipCode: '110001',
        country: 'India',
        phone: '',
        isDefault: true,
      };
    }

    // 3. Verify stock availability
    const inventoryCheck = await checkInventoryAvailability(items);
    if (!inventoryCheck.valid) {
      return NextResponse.json({ error: inventoryCheck.reason }, { status: 400 });
    }

    // 4. Server authoritative price calculation
    const pricingResult = await calculateOrderPricing(items, deliveryOptionId, promoCode);
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

    // 6. Try creating order in DB
    let newOrder: any = null;
    try {
      const { prisma } = await import('@/lib/prisma');

      // Ensure user exists in Prisma User table so foreign key doesn't fail
      await prisma.user.upsert({
        where: { id: session.user.id },
        create: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
        update: {},
      }).catch(() => {});

      newOrder = await prisma.$transaction(async (tx) => {
        // Concurrency-safe inventory decrement
        for (const item of pricing.items) {
          try {
            await tx.productInventory.upsert({
              where: { productId: item.productId },
              create: {
                productId: item.productId,
                stock: Math.max(0, 100 - item.quantity),
                reserved: 0,
              },
              update: {
                stock: { decrement: item.quantity },
              },
            });
          } catch {}
        }

        const paymentStatus = paymentResult.status;
        const orderStatus = 'CONFIRMED';

        return tx.order.create({
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
                cardLast4: paymentDetails?.cardLast4 || (paymentProvider === 'SIMULATED_CARD' ? '4242' : undefined),
                cardBrand: paymentDetails?.cardBrand || (paymentProvider === 'SIMULATED_CARD' ? 'Visa' : undefined),
              },
            },
          },
          include: {
            items: true,
            addressSnapshot: true,
            payment: true,
          },
        });
      });
    } catch (dbErr: any) {
      console.warn('[orders POST] DB unavailable, creating in-memory order:', dbErr?.message);
    }

    // If DB is unavailable, build authoritative fallback order
    if (!newOrder) {
      newOrder = {
        id: `ord_${Date.now()}`,
        orderNumber,
        userId: session.user.id,
        status: 'CONFIRMED',
        paymentStatus: paymentResult.status,
        currency: pricing.currency,
        subtotal: pricing.subtotal,
        shipping: pricing.shipping,
        tax: pricing.tax,
        discount: pricing.discount,
        total: pricing.total,
        deliveryMethod: pricing.deliveryOption.name,
        estimatedDelivery: pricing.deliveryOption.estimatedDelivery,
        createdAt: new Date().toISOString(),
        items: pricing.items.map((i, idx) => ({
          id: `item_${idx}_${Date.now()}`,
          productId: i.productId,
          productTitle: i.productTitle,
          productImage: i.productImage,
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          lineTotal: i.lineTotal,
        })),
        addressSnapshot: {
          id: `addr_snap_${Date.now()}`,
          fullName: address.fullName,
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          phone: address.phone,
          instructions: address.instructions,
        },
        payment: {
          id: `pay_${Date.now()}`,
          provider: paymentProvider,
          providerReference: paymentResult.providerReference,
          amount: pricing.total,
          currency: pricing.currency,
          status: paymentResult.status,
          cardLast4: paymentDetails?.cardLast4 || (paymentProvider === 'SIMULATED_CARD' ? '4242' : undefined),
          cardBrand: paymentDetails?.cardBrand || (paymentProvider === 'SIMULATED_CARD' ? 'Visa' : undefined),
        },
      };
    }

    // Always persist order to cookie storage for immediate retrieval
    await saveCookieOrder(session.user.id, newOrder);

    // Send confirmation email asynchronously
    sendOrderConfirmationEmail(
      session.user.email,
      session.user.name,
      newOrder.orderNumber,
      newOrder.total,
      newOrder.estimatedDelivery,
      pricing.items.map((i) => ({
        title: i.productTitle,
        quantity: i.quantity,
        price: i.unitPrice,
      }))
    ).catch((emailErr) => console.error('Error sending order email:', emailErr));

    return NextResponse.json({
      success: true,
      order: newOrder,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while placing your order.' },
      { status: 500 }
    );
  }
}
