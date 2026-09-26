import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/server-session';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/products/[id]/reviews
 * Returns paginated reviews. Returns empty list if DB is unavailable.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);

    const sort = searchParams.get('sort') || 'relevance';
    const star = searchParams.get('star');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    try {
      const { mockReviews } = await import('@/data/mockReviews');
      let reviews = mockReviews.filter((r) => r.productId === productId);

      if (star) {
        const starNum = parseInt(star, 10);
        if (starNum >= 1 && starNum <= 5) reviews = reviews.filter((r) => r.rating === starNum);
      }
      if (verifiedOnly) reviews = reviews.filter((r) => r.verifiedPurchase);

      if (sort === 'recent') reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      else if (sort === 'highest') reviews.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      else if (sort === 'lowest') reviews.sort((a, b) => a.rating - b.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      else reviews.sort((a, b) => b.helpfulCount - a.helpfulCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const totalCount = reviews.length;
      const paginatedReviews = reviews.slice(skip, skip + limit);

      const formattedReviews = paginatedReviews.map((r) => {
        const parts = (r.userName || 'Apex Customer').split(' ');
        const displayName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
        return {
          id: r.id,
          productId: r.productId,
          rating: r.rating,
          title: r.title,
          body: r.body,
          verifiedPurchase: r.verifiedPurchase,
          helpfulCount: r.helpfulCount,
          createdAt: r.createdAt,
          updatedAt: r.createdAt,
          reviewer: { id: `user-${r.userName}`, name: displayName, image: null },
        };
      });

      return NextResponse.json({
        reviews: formattedReviews,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      });
    } catch (dbErr: any) {
      console.warn('[reviews GET] mock data unavailable:', dbErr?.message);
      return NextResponse.json({ reviews: [], totalCount: 0, page, limit, totalPages: 1 });
    }
  } catch (error: any) {
    console.error('[reviews GET] Error:', error?.message);
    return NextResponse.json({ reviews: [], totalCount: 0, page: 1, limit: 10, totalPages: 1 });
  }
}

/**
 * POST /api/products/[id]/reviews
 * Submit a customer review for the product.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: productId } = await params;
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required to submit a review' }, { status: 401 });
    }

    const body = await request.json();
    const { rating, title, body: reviewBody } = body;

    const ratingInt = Number(rating);
    if (!Number.isInteger(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5 stars' }, { status: 400 });
    }
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Review title is required' }, { status: 400 });
    }
    if (title.trim().length > 120) {
      return NextResponse.json({ error: 'Review title must not exceed 120 characters' }, { status: 400 });
    }
    if (!reviewBody || typeof reviewBody !== 'string' || reviewBody.trim().length === 0) {
      return NextResponse.json({ error: 'Review text is required' }, { status: 400 });
    }
    if (reviewBody.trim().length > 5000) {
      return NextResponse.json({ error: 'Review text must not exceed 5000 characters' }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');

    const existingReview = await prisma.review.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already submitted a review for this product.', existingReviewId: existingReview.id },
        { status: 409 }
      );
    }

    // Check for verified purchase (non-fatal if DB query fails)
    let isVerified = false;
    try {
      const order = await prisma.order.findFirst({
        where: {
          userId: session.user.id,
          status: { notIn: ['CANCELLED', 'PENDING'] },
          paymentStatus: { in: ['PAID', 'PENDING'] },
          items: { some: { productId } },
        },
        select: { id: true },
      });
      isVerified = Boolean(order);
    } catch {}

    const newReview = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating: ratingInt,
        title: title.trim(),
        body: reviewBody.trim(),
        verifiedPurchase: isVerified,
        status: 'PUBLISHED',
      },
      include: { user: { select: { id: true, name: true } } },
    });

    return NextResponse.json(
      {
        message: 'Review submitted successfully',
        review: {
          id: newReview.id,
          rating: newReview.rating,
          title: newReview.title,
          body: newReview.body,
          verifiedPurchase: newReview.verifiedPurchase,
          helpfulCount: newReview.helpfulCount,
          createdAt: newReview.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[reviews POST] Error:', error?.message);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
