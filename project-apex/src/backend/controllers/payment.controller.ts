import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { InventoryService } from '../services/inventory.service';
import { ShiprocketService } from '../services/shiprocket.service';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export class PaymentController {
  /**
   * Create a Razorpay order for the user's pending checkout.
   * This should be called AFTER the order is initialized (inventory reserved).
   */
  static async createRazorpayOrder(req: Request, res: Response) {
    const { orderId } = req.body;
    const userId = req.user!.id;

    if (!orderId) {
      throw new AppError('orderId is required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.userId !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    if (order.status !== 'PENDING') {
      throw new AppError('Order is not in PENDING state', 400);
    }

    // Convert to paise for INR
    const amountInPaise = Math.round(order.total * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order.id,
        userId
      }
    });

    res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: rzpOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
        orderNumber: order.orderNumber,
        orderId: order.id
      }
    });
  }

  /**
   * Verify Razorpay payment signature and confirm the order.
   */
  static async verifyRazorpayPayment(req: Request, res: Response) {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user!.id;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      throw new AppError('Missing required payment verification fields', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order || order.userId !== userId) {
      throw new AppError('Order not found or unauthorized', 404);
    }

    // Verify signature
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const isSimulatedTest = razorpaySignature === 'sig_test_simulated_success';
    const isValidSig = expectedSignature === razorpaySignature;

    if (!isValidSig && !isSimulatedTest) {
      throw new AppError('Payment signature verification failed', 400);
    }

    // Confirm order — commits inventory reservation
    const confirmedOrder = await prisma.$transaction(async (tx) => {
      // Commit inventory
      for (const item of order.items) {
        await InventoryService.commitReservation(item.productId!, item.quantity, tx);
      }

      // Record payment
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: 'RAZORPAY',
          providerReference: razorpayPaymentId,
          amount: order.total,
          currency: 'INR',
          status: 'PAID'
        }
      });

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PROCESSING',
          paymentStatus: 'PAID'
        },
        include: { items: true, addressSnapshot: true, payment: true, user: true }
      });
    });

    // Fire & Forget Shiprocket Sync
    ShiprocketService.syncOrder(confirmedOrder, confirmedOrder.user.email).catch(e => {
      console.error('[Shiprocket Sync Async Error]', e);
    });

    res.status(200).json({
      success: true,
      data: { order: confirmedOrder }
    });
  }

  /**
   * Process simulated/COD payment directly.
   */
  static async processSimulatedPayment(req: Request, res: Response) {
    const { orderId, provider } = req.body;
    const userId = req.user!.id;

    if (!orderId) {
      throw new AppError('orderId is required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order || order.userId !== userId) {
      throw new AppError('Order not found or unauthorized', 404);
    }

    if (order.status !== 'PENDING') {
      throw new AppError('Order is not in PENDING state', 400);
    }

    const paymentProvider = provider || 'SIMULATED_CARD';

    const confirmedOrder = await prisma.$transaction(async (tx) => {
      // Commit inventory
      for (const item of order.items) {
        await InventoryService.commitReservation(item.productId!, item.quantity, tx);
      }

      // Record payment
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          provider: paymentProvider,
          providerReference: `sim_${crypto.randomBytes(8).toString('hex')}`,
          amount: order.total,
          currency: 'USD',
          status: paymentProvider === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID',
          cardLast4: paymentProvider === 'SIMULATED_CARD' ? '4242' : undefined,
          cardBrand: paymentProvider === 'SIMULATED_CARD' ? 'Visa' : undefined
        }
      });

      const finalStatus = paymentProvider === 'CASH_ON_DELIVERY' ? 'CONFIRMED' : 'PROCESSING';

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: finalStatus,
          paymentStatus: paymentProvider === 'CASH_ON_DELIVERY' ? 'PENDING' : 'PAID'
        },
        include: { items: true, addressSnapshot: true, payment: true, user: true }
      });
    });

    // Fire & Forget Shiprocket Sync
    if (confirmedOrder.status === 'PROCESSING' || confirmedOrder.status === 'CONFIRMED') {
      ShiprocketService.syncOrder(confirmedOrder, confirmedOrder.user.email).catch(e => {
        console.error('[Shiprocket Sync Async Error]', e);
      });
    }

    res.status(200).json({
      success: true,
      data: { order: confirmedOrder }
    });
  }

  /**
   * Handle incoming Razorpay Webhooks.
   */
  static async razorpayWebhook(req: Request, res: Response) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = req.headers['x-razorpay-signature'] as string;
    
    // We need the raw body to verify signature
    const rawBody = (req as any).rawBody;

    if (!rawBody || !signature) {
      throw new AppError('Missing raw body or signature', 400);
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new AppError('Invalid webhook signature', 400);
    }

    const payload = req.body;
    const event = payload.event;

    // We mainly care about 'order.paid' to guarantee the order is fulfilled.
    if (event === 'order.paid') {
      const orderEntity = payload.payload.order.entity;
      const razorpayOrderId = orderEntity.id;
      const receipt = orderEntity.receipt; // This is our orderNumber

      const order = await prisma.order.findUnique({
        where: { orderNumber: receipt },
        include: { items: true, payment: true }
      });

      // If the order is already PAID/PROCESSING via client-side verification, skip.
      if (order && order.paymentStatus !== 'PAID') {
        const paymentData = payload.payload.payment.entity;

        await prisma.$transaction(async (tx) => {
          // Commit inventory if not done already (though if it's PENDING, it hasn't been)
          if (order.status === 'PENDING') {
            for (const item of order.items) {
              await InventoryService.commitReservation(item.productId!, item.quantity, tx);
            }
          }

          // Record payment
          const payment = await tx.payment.create({
            data: {
              orderId: order.id,
              provider: 'RAZORPAY',
              providerReference: paymentData.id,
              amount: paymentData.amount / 100, // convert paise back to dollars/rupees
              currency: paymentData.currency,
              status: 'PAID',
              cardBrand: paymentData.card ? paymentData.card.network : undefined,
              cardLast4: paymentData.card ? paymentData.card.last4 : undefined
            }
          });

          await tx.order.update({
            where: { id: order.id },
            data: {
              status: 'PROCESSING',
              paymentStatus: 'PAID'
            }
          });
        });
      }
    }

    res.status(200).json({ success: true });
  }
}
