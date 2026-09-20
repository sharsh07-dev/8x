import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { getCookieOrders } from '@/lib/user-storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { orderId } = await params;

  let order: any = null;

  // 1. Try DB lookup
  try {
    const { prisma } = await import('@/lib/prisma');
    order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        items: true,
        addressSnapshot: true,
        payment: true,
      },
    });
  } catch (dbErr: any) {
    console.warn('[orders/[orderId] GET] DB unavailable:', dbErr?.message);
  }

  // 2. Fallback to cookie storage
  if (!order) {
    const cookieOrders = await getCookieOrders(session.user.id);
    order = cookieOrders.find((o) => o.id === orderId || o.orderNumber === orderId);
  }

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Strict server-side ownership enforcement
  if (order.userId !== session.user.id) {
    return NextResponse.json(
      { error: 'You do not have authorization to view this order.' },
      { status: 403 }
    );
  }

  return NextResponse.json({ order });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { orderId } = await params;

  try {
    const { prisma } = await import('@/lib/prisma');
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this order' }, { status: 403 });
    }

    if (order.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
    }

    if (order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      return NextResponse.json(
        { error: 'Cannot cancel an order that has already shipped or delivered' },
        { status: 400 }
      );
    }

    // Cancel order and restore stock in transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const item of order.items) {
        try {
          await tx.productInventory.update({
            where: { productId: item.productId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        } catch {}
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'REFUNDED',
        },
        include: {
          items: true,
          addressSnapshot: true,
          payment: true,
        },
      });
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('[orders/[orderId] POST] Error:', error?.message);
    return NextResponse.json(
      { error: 'Unable to cancel order at this time.' },
      { status: 500 }
    );
  }
}
