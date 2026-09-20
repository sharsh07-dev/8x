import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { verifyRazorpaySignature } from '@/lib/payments/razorpay';
import { sendOrderConfirmationEmail } from '@/lib/email';

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
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { error: 'Missing required verification parameters' },
        { status: 400 }
      );
    }

    // 1. Verify payment signature
    const isValidSignature = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature || '',
    });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        addressSnapshot: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to verify this order' },
        { status: 403 }
      );
    }

    if (!isValidSignature) {
      // Mark as payment failed
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });

      return NextResponse.json(
        { error: 'Payment verification failed: invalid signature' },
        { status: 400 }
      );
    }

    // 2. Transactionally update order, record payment, and decrement inventory
    const [confirmedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
        },
      }),
      prisma.payment.upsert({
        where: { orderId },
        create: {
          orderId,
          provider: 'RAZORPAY',
          providerReference: razorpayPaymentId,
          amount: order.total,
          currency: order.currency,
          status: 'PAID',
        },
        update: {
          status: 'PAID',
          providerReference: razorpayPaymentId,
        },
      }),
      // Decrement inventory for items
      ...order.items.map((item) =>
        prisma.productInventory.upsert({
          where: { productId: item.productId },
          create: {
            productId: item.productId,
            stock: Math.max(0, 100 - item.quantity),
          },
          update: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      ),
    ]);

    // Send confirmation email asynchronously
    sendOrderConfirmationEmail({
      to: session.user.email,
      orderNumber: confirmedOrder.orderNumber,
      orderId: confirmedOrder.id,
      customerName: session.user.name,
      items: order.items.map((it) => ({
        title: it.productTitle,
        quantity: it.quantity,
        price: it.unitPrice,
      })),
      total: confirmedOrder.total,
      estimatedDelivery: confirmedOrder.estimatedDelivery,
      shippingAddress: order.addressSnapshot
        ? `${order.addressSnapshot.street}, ${order.addressSnapshot.city}, ${order.addressSnapshot.state} ${order.addressSnapshot.zipCode}`
        : 'Default Shipping Address',
    }).catch((emailErr) => console.error('Error sending confirmation email:', emailErr));

    return NextResponse.json({
      success: true,
      orderId: confirmedOrder.id,
      orderNumber: confirmedOrder.orderNumber,
      message: 'Payment verified and order confirmed successfully',
    });
  } catch (error: any) {
    console.error('Error in Razorpay verification:', error);
    return NextResponse.json(
      { error: 'Failed to verify Razorpay payment: ' + error.message },
      { status: 500 }
    );
  }
}
