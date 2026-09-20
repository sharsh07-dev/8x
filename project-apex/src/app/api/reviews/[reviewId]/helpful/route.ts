import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface RouteContext {
  params: Promise<{
    reviewId: string;
  }>;
}

/**
 * POST /api/reviews/[reviewId]/helpful
 * Record a helpful vote. Prevents repeated voting with unique constraint.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { reviewId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required to vote' },
        { status: 401 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, userId: true, helpfulCount: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    if (review.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot vote on your own review' },
        { status: 400 }
      );
    }

    // Check if user already voted
    const existingVote = await prisma.reviewHelpfulVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId: session.user.id,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        {
          message: 'You have already voted this review as helpful',
          helpfulCount: review.helpfulCount,
          hasVoted: true,
        },
        { status: 200 }
      );
    }

    // Transactionally create vote and increment helpfulCount
    const [, updatedReview] = await prisma.$transaction([
      prisma.reviewHelpfulVote.create({
        data: {
          reviewId,
          userId: session.user.id,
        },
      }),
      prisma.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
        select: {
          helpfulCount: true,
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Helpful vote recorded',
      helpfulCount: updatedReview.helpfulCount,
      hasVoted: true,
    });
  } catch (error: any) {
    console.error('Error recording helpful vote:', error);
    return NextResponse.json(
      { error: 'Failed to record helpful vote' },
      { status: 500 }
    );
  }
}
