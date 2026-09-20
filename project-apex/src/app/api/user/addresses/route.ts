import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-session';

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { prisma } = await import('@/lib/prisma');
    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: 'desc' },
    });
    return NextResponse.json({ addresses });
  } catch (dbErr: any) {
    console.warn('[addresses GET] DB unavailable:', dbErr?.message);
    return NextResponse.json({ addresses: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fullName, street, city, state, zipCode, country, phone, isDefault, instructions } = body;

    if (!fullName || !street || !city || !state || !zipCode) {
      return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    // If this address is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName,
        street,
        city,
        state,
        zipCode,
        country: country || 'India',
        phone,
        isDefault: Boolean(isDefault),
        instructions,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error: any) {
    console.error('[addresses POST] error:', error?.message);
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const addressId = searchParams.get('id');

  if (!addressId) {
    return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
  }

  try {
    const { prisma } = await import('@/lib/prisma');

    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
    }

    await prisma.address.delete({ where: { id: addressId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[addresses DELETE] error:', error?.message);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
