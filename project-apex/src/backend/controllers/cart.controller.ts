import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../middlewares/errorHandler';
import { InventoryService } from '../services/inventory.service';
import crypto from 'crypto';
import redis from '../utils/redis';

export class CartController {
  /**
   * Helper to resolve the active cart for the user or anonymous session
   */
  public static async getActiveCart(req: Request, res: Response) {
    let cart = null;

    if (req.user) {
      // Find user cart
      cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
        include: { items: { include: { product: { include: { images: true } } } } }
      });
      
      const anonCartId = req.cookies.apex_anon_cart;
      if (anonCartId) {
        const anonCart = await prisma.cart.findUnique({
          where: { sessionId: anonCartId },
          include: { items: true }
        });
        
        if (anonCart && anonCart.items.length > 0) {
          if (!cart) {
            cart = await prisma.cart.update({
              where: { id: anonCart.id },
              data: { userId: req.user.id, sessionId: null },
              include: { items: { include: { product: { include: { images: true } } } } }
            });
          } else {
            // Merge items into existing cart
            for (const item of anonCart.items) {
              const existingItem = cart.items.find(i => i.productId === item.productId);
              if (existingItem) {
                await prisma.cartItem.update({
                  where: { id: existingItem.id },
                  data: { quantity: existingItem.quantity + item.quantity }
                });
              } else {
                await prisma.cartItem.create({
                  data: { cartId: cart.id, productId: item.productId, quantity: item.quantity }
                });
              }
            }
            await prisma.cart.delete({ where: { id: anonCart.id } });
            
            cart = await prisma.cart.findUnique({
              where: { id: cart.id },
              include: { items: { include: { product: { include: { images: true } } } } }
            });
          }
        }
        res.clearCookie('apex_anon_cart');
      }

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId: req.user.id },
          include: { items: { include: { product: { include: { images: true } } } } }
        });
      }
    } else {
      // Anonymous user
      let anonCartId = req.cookies.apex_anon_cart;
      
      if (anonCartId) {
        cart = await prisma.cart.findUnique({
          where: { sessionId: anonCartId },
          include: { items: { include: { product: { include: { images: true } } } } }
        });
      }

      if (!cart) {
        anonCartId = crypto.randomBytes(16).toString('hex');
        cart = await prisma.cart.create({
          data: { sessionId: anonCartId },
          include: { items: { include: { product: { include: { images: true } } } } }
        });

        res.cookie('apex_anon_cart', anonCartId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
      }
    }

    return cart;
  }

  /**
   * Helper to invalidate the cart cache
   */
  private static async invalidateCartCache(cartId: string, userId?: string, sessionId?: string) {
    const keys = [`cart:${cartId}`];
    if (userId) keys.push(`cart:user:${userId}`);
    if (sessionId) keys.push(`cart:anon:${sessionId}`);
    
    if (keys.length > 0) {
      await redis.del(...keys).catch(() => {});
    }
  }

  static async getCart(req: Request, res: Response) {
    const cacheKey = req.user 
      ? `cart:user:${req.user.id}` 
      : req.cookies.apex_anon_cart 
        ? `cart:anon:${req.cookies.apex_anon_cart}` 
        : null;

    if (cacheKey) {
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) {
        return res.status(200).json(JSON.parse(cached));
      }
    }

    const cart = await CartController.getActiveCart(req, res);
    
    // Calculate totals securely on server
    const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const responseData = {
      success: true,
      data: { cart, subtotal, totalItems }
    };

    if (cacheKey) {
      await redis.setex(cacheKey, 3600, JSON.stringify(responseData)).catch(() => {});
    }

    res.status(200).json(responseData);
  }

  static async addItem(req: Request, res: Response) {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      throw new AppError('Invalid product or quantity', 400);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'ACTIVE') {
      throw new AppError('Product not found or unavailable', 404);
    }

    const cart = await CartController.getActiveCart(req, res);

    // Upsert Cart Item
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    const totalRequestedQty = existingItem ? existingItem.quantity + quantity : quantity;

    // Phase 8: Strict Inventory Check before Cart addition
    const hasStock = await InventoryService.checkAvailability(productId, totalRequestedQty);
    if (!hasStock) {
      throw new AppError('Insufficient stock available for this product', 409);
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity
        }
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { images: true } } } } }
    });

    await CartController.invalidateCartCache(cart.id, cart.userId || undefined, cart.sessionId || undefined);

    res.status(200).json({ success: true, data: { cart: updatedCart } });
  }

  static async updateItem(req: Request, res: Response) {
    const itemId = req.params.id as string; // Product ID
    const { quantity } = req.body;

    if (quantity < 0) {
      throw new AppError('Quantity cannot be negative', 400);
    }

    const cart = await CartController.getActiveCart(req, res);

    if (quantity > 0) {
      // Phase 8: Strict Inventory Check before Cart update
      const hasStock = await InventoryService.checkAvailability(itemId, quantity);
      if (!hasStock) {
        throw new AppError('Insufficient stock available for this product', 409);
      }
    }

    if (quantity === 0) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id, productId: itemId }
      });
    } else {
      await prisma.cartItem.updateMany({
        where: { cartId: cart.id, productId: itemId },
        data: { quantity }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { images: true } } } } }
    });

    await CartController.invalidateCartCache(cart.id, cart.userId || undefined, cart.sessionId || undefined);

    res.status(200).json({ success: true, data: { cart: updatedCart } });
  }

  static async removeItem(req: Request, res: Response) {
    const itemId = req.params.id as string; // Product ID
    const cart = await CartController.getActiveCart(req, res);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId: itemId }
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: { include: { images: true } } } } }
    });

    await CartController.invalidateCartCache(cart.id, cart.userId || undefined, cart.sessionId || undefined);

    res.status(200).json({ success: true, data: { cart: updatedCart } });
  }
}
