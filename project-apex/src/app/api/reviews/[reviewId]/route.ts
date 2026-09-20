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
 * PATCH /api/reviews/[reviewId]
 * Allows a customer to update their own existing review.
 */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const { reviewId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    if (review.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to modify this review' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { rating, title, body: reviewBody } = body;

    const updateData: any = {};

    if (rating !== undefined) {
      const ratingInt = Number(rating);
      if (!Number.isInteger(ratingInt) || ratingInt < 1 || ratingInt > 5) {
        return NextResponse.json(
          { error: 'Rating must be an integer between 1 and 5 stars' },
          { status: 400 }
        );
      }
      updateData.rating = ratingInt;
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 120) {
        return NextResponse.json(
          { error: 'Review title must be between 1 and 120 characters' },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (reviewBody !== undefined) {
      if (typeof reviewBody !== 'string' || reviewBody.trim().length === 0 || reviewBody.trim().length > 5000) {
        return NextResponse.json(
          { error: 'Review text must be between 1 and 5000 characters' },
          { status: 400 }
        );
      }
      updateData.body = reviewBody.trim();
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    return NextResponse.json({
      message: 'Review updated successfully',
      review: updated,
    });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews/[reviewId]
 * Allows a customer to delete their own review.
 */
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { reviewId } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    if (review.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this review' },
        { status: 403 }
      );
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      message: 'Review deleted successfully',
      deletedId: reviewId,
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
