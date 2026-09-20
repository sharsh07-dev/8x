import { prisma } from '@/lib/prisma';
import { mockProducts } from '@/data/mockProducts';

/**
 * Ensures inventory table has entries for all products in catalog.
 */
export async function ensureInventorySeeded() {
  for (const p of mockProducts) {
    await prisma.productInventory.upsert({
      where: { productId: p.id },
      update: {},
      create: {
        productId: p.id,
        stock: p.stock ?? 25,
        reserved: 0,
      },
    });
  }
}

/**
 * Verifies stock availability for a list of items.
 * Returns { valid: true } or { valid: false, reason: string, unavailableItem?: any }
 */
export async function checkInventoryAvailability(
  items: { productId: string; quantity: number }[]
): Promise<{ valid: boolean; reason?: string; item?: { productId: string; available: number } }> {
  await ensureInventorySeeded();

  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) {
      return { valid: false, reason: `Invalid quantity for product ${item.productId}` };
    }

    const inventory = await prisma.productInventory.findUnique({
      where: { productId: item.productId },
    });

    if (!inventory) {
      // Find from mockProducts if present
      const mock = mockProducts.find((p) => p.id === item.productId);
      if (!mock || !mock.inStock) {
        return { valid: false, reason: `Product ${item.productId} is not available` };
      }
      if (mock.stock < item.quantity) {
        return {
          valid: false,
          reason: `Only ${mock.stock} items left in stock for "${mock.title}"`,
          item: { productId: item.productId, available: mock.stock },
        };
      }
    } else {
      if (inventory.stock < item.quantity) {
        const prod = mockProducts.find((p) => p.id === item.productId);
        const title = prod ? prod.title : item.productId;
        return {
          valid: false,
          reason: `Only ${inventory.stock} items left in stock for "${title}"`,
          item: { productId: item.productId, available: inventory.stock },
        };
      }
    }
  }

  return { valid: true };
}
