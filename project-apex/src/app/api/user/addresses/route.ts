import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import {
  getUserAddresses,
  createUserAddress,
  deleteCookieAddress,
} from '@/lib/user-storage';

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const addresses = await getUserAddresses(session.user.id);
    return NextResponse.json({ addresses });
  } catch (err: any) {
    console.error('[addresses GET] error:', err?.message);
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

    const address = await createUserAddress(
      session.user.id,
      {
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
      {
        name: session.user.name,
        email: session.user.email,
      }
    );

    return NextResponse.json({ address }, { status: 201 });
  } catch (error: any) {
    console.error('[addresses POST] error:', error?.message);
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 });
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
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.address.deleteMany({
        where: { id: addressId, userId: session.user.id },
      });
    } catch {}

    await deleteCookieAddress(session.user.id, addressId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[addresses DELETE] error:', error?.message);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
