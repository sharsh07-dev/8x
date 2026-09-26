import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      title: { contains: q, mode: 'insensitive' }
    },
    select: { title: true },
    take: 8
  });

  // return just array of titles
  return NextResponse.json(products.map(p => p.title));
}
