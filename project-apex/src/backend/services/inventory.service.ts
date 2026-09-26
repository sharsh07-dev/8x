import { prisma } from '../../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

export class InventoryService {
  /**
   * Check if a product has enough available stock.
   * Available stock is defined as (total physical stock) - (currently reserved stock).
   */
  static async checkAvailability(productId: string, requestedQuantity: number): Promise<boolean> {
    const inventory = await prisma.productInventory.findUnique({
      where: { productId }
    });

    if (!inventory) {
      throw new AppError('Inventory record not found for product', 404);
    }

    const available = inventory.stock - inventory.reserved;
    return available >= requestedQuantity;
  }

  /**
   * Reserve stock temporarily during the checkout process.
   * This prevents overselling while the user is completing payment.
   */
  static async reserveStock(productId: string, quantity: number, tx: any = prisma): Promise<void> {
    // We use a transaction or the provided PrismaClient transaction instance (tx)
    // to execute the reservation atomically.
    const inventory = await tx.productInventory.findUnique({
      where: { productId }
    });

    if (!inventory) {
      throw new AppError(`Inventory not found for product ${productId}`, 404);
    }

    const available = inventory.stock - inventory.reserved;
    if (available < quantity) {
      throw new AppError(`Insufficient stock for product ${productId}. Available: ${available}`, 409);
    }

    await tx.productInventory.update({
      where: { productId },
      data: {
        reserved: { increment: quantity }
      }
    });
  }

  /**
   * Commit a stock reservation once an order is finalized (e.g. payment successful).
   * This permanently removes the stock from physical count and releases the reservation.
   */
  static async commitReservation(productId: string, quantity: number, tx: any = prisma): Promise<void> {
    const inventory = await tx.productInventory.findUnique({
      where: { productId }
    });

    if (!inventory || inventory.reserved < quantity) {
      throw new AppError(`Invalid reservation state for product ${productId}`, 409);
    }

    await tx.productInventory.update({
      where: { productId },
      data: {
        stock: { decrement: quantity },
        reserved: { decrement: quantity }
      }
    });
  }

  /**
   * Release a stock reservation if an order is cancelled or expires.
   */
  static async releaseReservation(productId: string, quantity: number, tx: any = prisma): Promise<void> {
    const inventory = await tx.productInventory.findUnique({
      where: { productId }
    });

    if (!inventory || inventory.reserved < quantity) {
      // If there's a discrepancy, we only decrement up to the reserved amount
      const safeRelease = inventory ? Math.min(inventory.reserved, quantity) : 0;
      if (safeRelease > 0) {
        await tx.productInventory.update({
          where: { productId },
          data: {
            reserved: { decrement: safeRelease }
          }
        });
      }
      return;
    }

    await tx.productInventory.update({
      where: { productId },
      data: {
        reserved: { decrement: quantity }
      }
    });
  }
}
