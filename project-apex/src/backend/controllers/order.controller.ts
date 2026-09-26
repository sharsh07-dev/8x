import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { InventoryService } from '../services/inventory.service';
import { CartController } from './cart.controller';
import { TaxService } from '../services/tax.service';
import { ShippingService } from '../services/shipping.service';
import { ShiprocketService } from '../services/shiprocket.service';
import crypto from 'crypto';

export class OrderController {
  /**
   * Initialize a new order from the user's active cart.
   * This locks the required inventory as "reserved".
   */
  static async initializeOrder(req: Request, res: Response) {
    const userId = req.user!.id;
    const { addressId, idempotencyKey, deliveryOptionId } = req.body;

    if (!addressId) {
      throw new AppError('Shipping address is required', 400);
    }

    if (idempotencyKey) {
      const existingRecord = await prisma.idempotencyRecord.findUnique({
        where: { key: idempotencyKey }
      });

      if (existingRecord && existingRecord.userId === userId) {
        const existingOrder = await prisma.order.findUnique({
          where: { id: existingRecord.orderId },
          include: { items: true, addressSnapshot: true }
        });

        if (existingOrder) {
          return res.status(200).json({ success: true, data: { order: existingOrder }, idempotentReplay: true });
        }
      }
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId }
    });

    if (!address) {
      throw new AppError('Invalid shipping address', 400);
    }

    // Call CartController to ensure anonymous carts are merged if needed
    const cart = await CartController.getActiveCart(req, res);

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Wrap the entire reservation and order creation in a transaction
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;

      // 1. Reserve Stock and Calculate Subtotal
      for (const item of cart.items) {
        if (item.product.status !== 'ACTIVE') {
          throw new AppError(`Product ${item.product.title} is unavailable`, 409);
        }

        // Lock stock for this item
        await InventoryService.reserveStock(item.productId, item.quantity, tx);

        subtotal += item.product.price * item.quantity;
      }

      const { cost: shipping, estimatedDelivery, method: deliveryMethod } = ShippingService.calculateShipping(subtotal, deliveryOptionId || 'FREE_STANDARD');
      const tax = TaxService.calculateTax(subtotal, address.state, address.country);
      const total = subtotal + tax + shipping;

      // 2. Create the Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          orderNumber: `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          subtotal,
          tax,
          shipping,
          total,
          deliveryMethod,
          estimatedDelivery,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              productTitle: item.product.title,
              productImage: item.product.images?.[0]?.url || 'https://via.placeholder.com/400',
              unitPrice: item.product.price,
              quantity: item.quantity,
              lineTotal: item.product.price * item.quantity
            }))
          },
          addressSnapshot: {
            create: {
              fullName: address.fullName,
              street: address.street,
              city: address.city,
              state: address.state,
              zipCode: address.zipCode,
              country: address.country,
              phone: address.phone
            }
          }
        },
        include: { items: true, addressSnapshot: true }
      });

      // 3. Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      // 4. Save Idempotency Key
      if (idempotencyKey) {
        await tx.idempotencyRecord.create({
          data: {
            key: idempotencyKey,
            userId,
            orderId: newOrder.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          }
        });
      }

      return newOrder;
    });

    res.status(201).json({ success: true, data: { order } });
  }

  /**
   * Confirm an order (usually called via Webhook after successful payment).
   * Commits the reserved stock permanently.
   */
  static async confirmOrder(req: Request, res: Response) {
    const orderId = req.params.id as string;
    
    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!existingOrder) {
        throw new AppError('Order not found', 404);
      }

      if (existingOrder.status !== 'PENDING') {
        throw new AppError('Order cannot be confirmed because it is not PENDING', 400);
      }

      // 1. Commit inventory reservations
      for (const item of existingOrder.items) {
        await InventoryService.commitReservation(item.productId!, item.quantity, tx);
      }

      // 2. Update Order Status
      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'PROCESSING',
          paymentStatus: 'PAID'
        }
      });
    });

    res.status(200).json({ success: true, data: { order } });
  }

  /**
   * Cancel an order. Releases reserved stock.
   */
  static async cancelOrder(req: Request, res: Response) {
    const orderId = req.params.id as string;

    const order = await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      });

      if (!existingOrder) {
        throw new AppError('Order not found', 404);
      }

      if (existingOrder.status !== 'PENDING' && existingOrder.status !== 'PROCESSING') {
        throw new AppError('Order cannot be cancelled at this stage', 400);
      }

      // 1. Release inventory reservations (if PENDING) or restore physical stock (if PROCESSING)
      for (const item of existingOrder.items) {
        if (existingOrder.status === 'PENDING') {
          await InventoryService.releaseReservation(item.productId!, item.quantity, tx);
        } else {
          // If it was processing, it was already committed. So we restore physical stock.
          await tx.productInventory.update({
            where: { productId: item.productId! },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      // 2. Cancel Order
      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          paymentStatus: existingOrder.paymentStatus === 'PAID' ? 'REFUNDED' : 'FAILED'
        }
      });
    });

    res.status(200).json({ success: true, data: { order } });
  }

  /**
   * Get all orders for the currently authenticated user.
   */
  static async getUserOrders(req: Request, res: Response) {
    const userId = req.user!.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: { items: true, payment: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.order.count({ where: { userId } })
    ]);

    res.status(200).json({
      success: true,
      data: { orders, total, page: Number(page), limit: Number(limit) }
    });
  }

  /**
   * Get a specific order by ID.
   * Customers can only view their own orders.
   */
  static async getOrderById(req: Request, res: Response) {
    const userId = req.user!.id;
    const role = req.user!.role;
    const orderId = req.params.id as string;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true, addressSnapshot: true }
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (role !== 'ADMIN' && order.userId !== userId) {
      throw new AppError('Forbidden. You cannot view this order.', 403);
    }

    res.status(200).json({ success: true, data: { order } });
  }

  /**
   * ADMIN: Get all orders across the system.
   */
  static async getAllOrders(req: Request, res: Response) {
    const { page = 1, limit = 20, status } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const whereClause = status ? { status: status as string } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: { items: true, payment: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.order.count({ where: whereClause })
    ]);

    res.status(200).json({
      success: true,
      data: { orders, total, page: Number(page), limit: Number(limit) }
    });
  }

  /**
   * ADMIN: Update an order's status (e.g. PROCESSING -> SHIPPED).
   */
  static async updateOrderStatus(req: Request, res: Response) {
    const orderId = req.params.id as string;
    const { status, trackingNumber } = req.body;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    const updatedData: any = { status };
    
    if (status === 'SHIPPED' && trackingNumber) {
       // Ideally we'd have a trackingNumber field, but if not we can just ignore it for now or add to notes
       // For this phase we simply update the status.
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updatedData,
      include: { items: true }
    });

    res.status(200).json({ success: true, data: { order: updatedOrder } });
  }

  /**
   * Get Tracking Details for an Order via Shiprocket
   */
  static async getOrderTracking(req: Request, res: Response) {
    const userId = req.user!.id;
    const orderId = req.params.id as string;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shipment: true }
    });

    if (!order || order.userId !== userId) {
      throw new AppError('Order not found or unauthorized', 404);
    }

    if (!order.shipment) {
      return res.status(200).json({ success: true, data: { status: order.status, tracking: null } });
    }

    // Try to fetch live tracking if we have an AWB
    let liveTracking = null;
    if (order.shipment.awb) {
      try {
        liveTracking = await ShiprocketService.trackAWB(order.shipment.awb);
        
        // Sync the latest status back to DB
        if (liveTracking?.tracking_data?.track_status) {
          await prisma.shipment.update({
            where: { id: order.shipment.id },
            data: {
              status: liveTracking.tracking_data.track_status === 1 ? 'DELIVERED' : 'IN_TRANSIT',
              lastSyncAt: new Date()
            }
          });
        }
      } catch (e: any) {
        console.error('[Tracking Fetch Error]', e.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        status: order.status,
        shipment: order.shipment,
        liveTracking: liveTracking
      }
    });
  }
}
