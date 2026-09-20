import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRazorpayWebhookSignature } from '@/lib/payments/razorpay';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret configured
    if (webhookSecret) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 400 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payload = event.payload?.payment?.entity;

    if (!payload) {
      return NextResponse.json({ received: true });
    }

    const orderReceipt = payload.notes?.orderId;
    const razorpayPaymentId = payload.id;

    if (eventType === 'payment.captured' && orderReceipt) {
      // Idempotently update order and payment
      await prisma.order.updateMany({
        where: {
          id: orderReceipt,
          paymentStatus: { not: 'PAID' },
        },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
        },
      });

      await prisma.payment.upsert({
        where: { orderId: orderReceipt },
        create: {
          orderId: orderReceipt,
          provider: 'RAZORPAY',
          providerReference: razorpayPaymentId,
          amount: payload.amount / 100,
          currency: payload.currency || 'USD',
          status: 'PAID',
        },
        update: {
          status: 'PAID',
          providerReference: razorpayPaymentId,
        },
      });
    } else if (eventType === 'payment.failed' && orderReceipt) {
      await prisma.order.updateMany({
        where: { id: orderReceipt },
        data: { paymentStatus: 'FAILED' },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing Razorpay webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}
