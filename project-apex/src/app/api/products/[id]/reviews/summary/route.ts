import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/products/[id]/reviews/summary
 * Returns rating summary. Returns empty summary if DB is unavailable.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: productId } = await params;

    try {
      const { prisma } = await import('@/lib/prisma');

      const reviews = await prisma.review.findMany({
        where: { productId, status: 'PUBLISHED' },
        select: { rating: true },
      });

      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return NextResponse.json({
          averageRating: 0,
          totalReviews: 0,
          hasReviews: false,
          distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percentage: 0 })),
        });
      }

      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const averageRating = Math.round((sum / totalReviews) * 10) / 10;

      const distribution = [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => r.rating === star).length;
        return {
          star,
          count,
          percentage: Math.round((count / totalReviews) * 100),
        };
      });

      return NextResponse.json({ averageRating, totalReviews, hasReviews: true, distribution });
    } catch (dbErr: any) {
      console.warn('[reviews/summary GET] DB unavailable:', dbErr?.message);
      // Return empty summary rather than 500
      return NextResponse.json({
        averageRating: 0,
        totalReviews: 0,
        hasReviews: false,
        distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percentage: 0 })),
      });
    }
  } catch (error: any) {
    console.error('[reviews/summary GET] Error:', error?.message);
    return NextResponse.json({
      averageRating: 0,
      totalReviews: 0,
      hasReviews: false,
      distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, percentage: 0 })),
    });
  }
}
