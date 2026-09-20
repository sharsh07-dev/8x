import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/server-session';
import { headers } from 'next/headers';
import { mockProducts } from '@/data/mockProducts';

/**
 * GET /api/account/reviews
 * Fetch all reviews written by the authenticated customer.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        productId: true,
        rating: true,
        title: true,
        body: true,
        verifiedPurchase: true,
        status: true,
        helpfulCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Map each review with product title & image from mockProducts
    const formatted = reviews.map((r) => {
      const product = mockProducts.find((p) => p.id === r.productId);
      return {
        ...r,
        productTitle: product?.title || 'Apex Product',
        productImage: product?.image || '/placeholder.png',
        productCategory: product?.category || 'General',
      };
    });

    return NextResponse.json({
      reviews: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    console.error('Error fetching account reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch your reviews' },
      { status: 500 }
    );
  }
}
