import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/server-session';
import { headers } from 'next/headers';

interface RouteContext {
  params: Promise<{
    reviewId: string;
  }>;
}

/**
 * POST /api/reviews/[reviewId]/report
 * Report a customer review for moderation.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { reviewId } = await params;
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required to report a review' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reason, details } = body;

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json(
        { error: 'Report reason is required' },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        userId: session.user.id,
        reason: reason.trim(),
        details: details && typeof details === 'string' ? details.trim() : null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      message: 'Thank you. Your report has been submitted to our moderation team.',
      reportId: report.id,
    });
  } catch (error: any) {
    console.error('Error reporting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
