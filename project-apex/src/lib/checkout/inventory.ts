import { mockProducts } from '@/data/mockProducts';

/**
 * Verifies stock availability for a list of cart items.
 * 
 * First tries the database for real-time inventory.
 * Falls back to mockProducts stock values if DB is unavailable.
 * Never throws — always returns a valid result.
 */
export async function checkInventoryAvailability(
  items: { productId: string; quantity: number }[]
): Promise<{ valid: boolean; reason?: string; item?: { productId: string; available: number } }> {
  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) {
      return { valid: false, reason: `Invalid quantity for product ${item.productId}` };
    }

    // Try live DB inventory first
    try {
      const { prisma } = await import('@/lib/prisma');

      // Seed inventory record if missing (non-fatal)
      const mock = mockProducts.find((p) => p.id === item.productId);
      await prisma.productInventory.upsert({
        where: { productId: item.productId },
        update: {},
        create: {
          productId: item.productId,
          stock: mock?.stock ?? 25,
          reserved: 0,
        },
      }).catch(() => {});

      const inventory = await prisma.productInventory.findUnique({
        where: { productId: item.productId },
      });

      if (inventory) {
        if (inventory.stock < item.quantity) {
          const title = mock?.title ?? item.productId;
          return {
            valid: false,
            reason: `Only ${inventory.stock} items left in stock for "${title}"`,
            item: { productId: item.productId, available: inventory.stock },
          };
        }
        continue; // DB check passed, move to next item
      }
    } catch {
      // DB unavailable — fall through to mock check
    }

    // Fallback: use mockProducts stock data
    const mock = mockProducts.find((p) => p.id === item.productId);
    if (!mock || !mock.inStock) {
      return { valid: false, reason: `Product ${item.productId} is not available` };
    }
    if ((mock.stock ?? 99) < item.quantity) {
      return {
        valid: false,
        reason: `Only ${mock.stock} items left in stock for "${mock.title}"`,
        item: { productId: item.productId, available: mock.stock ?? 0 },
      };
    }
  }

  return { valid: true };
}
