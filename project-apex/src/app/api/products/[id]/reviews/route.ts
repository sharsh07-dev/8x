import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkVerifiedPurchase } from '@/lib/reviews/eligibility';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/products/[id]/reviews
 * Retrieve paginated, sorted, and filtered published reviews for a product.
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

    const where: any = {
      productId,
      status: 'PUBLISHED',
    };

    if (star) {
      const starNum = parseInt(star, 10);
      if (starNum >= 1 && starNum <= 5) {
        where.rating = starNum;
      }
    }

    if (verifiedOnly) {
      where.verifiedPurchase = true;
    }

    let orderBy: any = [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'recent') {
      orderBy = [{ createdAt: 'desc' }];
    } else if (sort === 'highest') {
      orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'lowest') {
      orderBy = [{ rating: 'asc' }, { createdAt: 'desc' }];
    }

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          productId: true,
          rating: true,
          title: true,
          body: true,
          verifiedPurchase: true,
          helpfulCount: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // Format safe reviewer display name (e.g. First Name + initial)
    const formattedReviews = reviews.map((r) => {
      const parts = (r.user?.name || 'Apex Customer').split(' ');
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
        updatedAt: r.updatedAt,
        reviewer: {
          id: r.user.id,
          name: displayName,
          image: r.user.image,
        },
      };
    });

    return NextResponse.json({
      reviews: formattedReviews,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products/[id]/reviews
 * Submit a customer review for the product.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: productId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required to submit a review' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating, title, body: reviewBody } = body;

    // Validate inputs
    const ratingInt = Number(rating);
    if (!Number.isInteger(ratingInt) || ratingInt < 1 || ratingInt > 5) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5 stars' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Review title is required' },
        { status: 400 }
      );
    }

    if (title.trim().length > 120) {
      return NextResponse.json(
        { error: 'Review title must not exceed 120 characters' },
        { status: 400 }
      );
    }

    if (!reviewBody || typeof reviewBody !== 'string' || reviewBody.trim().length === 0) {
      return NextResponse.json(
        { error: 'Review text is required' },
        { status: 400 }
      );
    }

    if (reviewBody.trim().length > 5000) {
      return NextResponse.json(
        { error: 'Review text must not exceed 5000 characters' },
        { status: 400 }
      );
    }

    // Check for duplicate review by this user on this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { 
          error: 'You have already submitted a review for this product.',
          existingReviewId: existingReview.id,
        },
        { status: 409 }
      );
    }

    // Server-verified purchase check from qualifying customer orders
    const isVerified = await checkVerifiedPurchase(session.user.id, productId);

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
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
