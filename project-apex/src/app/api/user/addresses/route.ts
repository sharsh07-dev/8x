import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: 'desc' },
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fullName, street, city, state, zipCode, country, phone, isDefault, instructions } = body;

    if (!fullName || !street || !city || !state || !zipCode) {
      return NextResponse.json({ error: 'Missing required address fields' }, { status: 400 });
    }

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
        country: country || 'United States',
        phone,
        isDefault: Boolean(isDefault),
        instructions,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const addressId = searchParams.get('id');

  if (!addressId) {
    return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
  }

  // Ensure users cannot delete another user's address (OWASP authorization check)
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Address not found or unauthorized' }, { status: 404 });
  }

  await prisma.address.delete({
    where: { id: addressId },
  });

  return NextResponse.json({ success: true });
}
