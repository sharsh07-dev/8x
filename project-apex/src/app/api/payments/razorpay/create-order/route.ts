import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { calculateOrderPricing } from '@/lib/checkout/pricing';
import { checkInventoryAvailability } from '@/lib/checkout/inventory';
import { createRazorpayOrder, getRazorpayPublicKey, isRazorpayConfigured } from '@/lib/payments/razorpay';
import { getUserAddresses, saveCookieOrder } from '@/lib/user-storage';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

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
    const pricingResult = await calculateOrderPricing(
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

    // 3. Verify delivery address (DB or cookie storage)
    const userAddresses = await getUserAddresses(session.user.id);
    let address = userAddresses.find((a) => a.id === addressId) || userAddresses[0];

    const orderNumber = `APX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    let pendingOrderId = `ord_rzp_${Date.now()}`;

    // 4. Try creating pending order in database
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.user.upsert({
        where: { id: session.user.id },
        create: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
        update: {},
      }).catch(() => {});

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
      pendingOrderId = pendingOrder.id;
    } catch (dbErr: any) {
      console.warn('[razorpay create-order] DB unavailable, creating in-memory pending order');
      const fallbackOrder = {
        id: pendingOrderId,
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
        createdAt: new Date().toISOString(),
        items: pricing.items.map((item, idx) => ({
          id: `item_${idx}_${Date.now()}`,
          productId: item.productId,
          productTitle: item.productTitle,
          productImage: item.productImage,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        addressSnapshot: address || {
          fullName: session.user.name || 'Valued Customer',
          street: 'Standard Delivery',
          city: 'City',
          state: 'State',
          zipCode: '110001',
          country: 'India',
        },
      };
      await saveCookieOrder(session.user.id, fallbackOrder);
    }

    // 5. Initiate Razorpay order in INR (amount in paise) to enable UPI & QR
    const amountInPaise = Math.round(pricing.total * 100);
    const rzpOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        orderId: pendingOrderId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      orderId: pendingOrderId,
      orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: getRazorpayPublicKey(),
      isConfigured: isRazorpayConfigured(),
      customerName: session.user.name,
      customerEmail: session.user.email,
      customerPhone: address?.phone || (session.user as any).phoneNumber || '9876543210',
    });
  } catch (error: any) {
    console.error('Error initiating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Razorpay order: ' + error.message },
      { status: 500 }
    );
  }
}
