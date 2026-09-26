import { getProductById } from '../catalog.service';

/**
 * Verifies stock availability for a list of cart items.
 * 
 * Uses the database for real-time inventory via catalog service.
 * Never throws — always returns a valid result.
 */
export async function checkInventoryAvailability(
  items: { productId: string; quantity: number }[]
): Promise<{ valid: boolean; reason?: string; item?: { productId: string; available: number } }> {
  for (const item of items) {
    if (!item.quantity || item.quantity <= 0) {
      return { valid: false, reason: `Invalid quantity for product ${item.productId}` };
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      const product = await getProductById(item.productId);

      if (!product) {
        return { valid: false, reason: `Product ${item.productId} is not available` };
      }

      const inventory = await prisma.productInventory.findUnique({
        where: { productId: item.productId },
      });

      if (inventory) {
        if (inventory.stock < item.quantity) {
          return {
            valid: false,
            reason: `Only ${inventory.stock} items left in stock for "${product.title}"`,
            item: { productId: item.productId, available: inventory.stock },
          };
        }
      } else {
        // Fallback check against product map if inventory record is missing
        if ((product.stock ?? 99) < item.quantity) {
          return {
            valid: false,
            reason: `Only ${product.stock} items left in stock for "${product.title}"`,
            item: { productId: item.productId, available: product.stock ?? 0 },
          };
        }
      }
    } catch {
      return { valid: false, reason: `Failed to check inventory for ${item.productId}` };
    }
  }

  return { valid: true };
}
