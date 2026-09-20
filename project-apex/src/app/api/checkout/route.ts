import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { calculateOrderPricing, DELIVERY_OPTIONS } from '@/lib/checkout/pricing';
import { checkInventoryAvailability } from '@/lib/checkout/inventory';

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required for checkout' }, { status: 401 });
  }

  // Load customer's saved addresses — gracefully handle DB being down
  let addresses: unknown[] = [];
  try {
    const { prisma } = await import('@/lib/prisma');
    addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  } catch (dbErr: any) {
    console.warn('[checkout GET] DB unavailable, returning empty addresses:', dbErr?.message);
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
    },
    addresses,
    deliveryOptions: Object.values(DELIVERY_OPTIONS),
    paymentMethods: [
      {
        id: 'RAZORPAY_UPI',
        name: 'UPI / QR Code',
        isMock: false,
        mockLabel: 'Google Pay, PhonePe, Paytm',
        description: 'Pay instantly via UPI or scan the QR code with any UPI app.',
      },
      {
        id: 'SIMULATED_CARD',
        name: 'Credit or Debit Card',
        isMock: true,
        mockLabel: 'Simulated Sandbox Mode',
        description: 'Simulate a successful card payment. No actual funds will be charged.',
      },
      {
        id: 'CASH_ON_DELIVERY',
        name: 'Cash on Delivery (COD)',
        isMock: false,
        mockLabel: 'Pay on Arrival',
        description: 'Pay with cash upon package receipt at your doorstep.',
      },
      {
        id: 'APEX_POINTS',
        name: 'Apex Rewards Points',
        isMock: true,
        mockLabel: 'Apex Loyalty 2,400 pts',
        description: 'Redeem stored loyalty points for this purchase.',
      },
    ],
  });
}

/**
 * Recalculates order pricing and stock verification authoritative on server
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items, deliveryOptionId, promoCode } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Check inventory availability
    const inventoryCheck = await checkInventoryAvailability(items);
    if (!inventoryCheck.valid) {
      return NextResponse.json({ error: inventoryCheck.reason }, { status: 400 });
    }

    // Authoritative pricing recalculation
    const pricingResult = calculateOrderPricing(items, deliveryOptionId, promoCode);
    if (!pricingResult.success) {
      return NextResponse.json({ error: pricingResult.error }, { status: 400 });
    }

    return NextResponse.json({
      pricing: pricingResult.pricing,
    });
  } catch (err: any) {
    console.error('Checkout preview error:', err);
    return NextResponse.json({ error: 'Failed to calculate checkout preview' }, { status: 500 });
  }
}
