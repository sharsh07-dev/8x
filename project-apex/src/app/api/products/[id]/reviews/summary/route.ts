import { NextRequest, NextResponse } from 'next/server';
import { calculateRatingSummary } from '@/lib/reviews/eligibility';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/products/[id]/reviews/summary
 * Fetch average rating, count, and 5-to-1 star distribution.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id: productId } = await params;
    const summary = await calculateRatingSummary(productId);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Error fetching rating summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rating summary' },
      { status: 500 }
    );
  }
}
