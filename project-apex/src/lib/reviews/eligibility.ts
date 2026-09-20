import { prisma } from '@/lib/prisma';

export interface RatingDistribution {
  star: number;
  count: number;
  percentage: number;
}

export interface ProductRatingSummary {
  averageRating: number;
  totalReviews: number;
  hasReviews: boolean;
  distribution: RatingDistribution[];
}

/**
 * Checks whether the user has a qualifying order for the product
 * Orders that are CANCELLED or have payment status FAILED are disqualified.
 */
export async function checkVerifiedPurchase(userId: string, productId: string): Promise<boolean> {
  if (!userId || !productId) return false;

  const qualifyingOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: {
        notIn: ['CANCELLED', 'PENDING'],
      },
      paymentStatus: {
        in: ['PAID', 'PENDING'], // COD can be PENDING payment but confirmed
      },
      items: {
        some: {
          productId,
        },
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(qualifyingOrder);
}

/**
 * Calculates real-time rating average and 5-to-1 star distribution for a product.
 */
export async function calculateRatingSummary(productId: string): Promise<ProductRatingSummary> {
  const reviews = await prisma.review.findMany({
    where: {
      productId,
      status: 'PUBLISHED',
    },
    select: {
      rating: true,
    },
  });

  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      hasReviews: false,
      distribution: [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: 0,
        percentage: 0,
      })),
    };
  }

  const sumRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = Number((sumRatings / totalReviews).toFixed(1));

  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    if (r.rating >= 1 && r.rating <= 5) {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    }
  }

  const distribution: RatingDistribution[] = [5, 4, 3, 2, 1].map((star) => {
    const count = counts[star] || 0;
    const percentage = Math.round((count / totalReviews) * 100);
    return {
      star,
      count,
      percentage,
    };
  });

  return {
    averageRating,
    totalReviews,
    hasReviews: true,
    distribution,
  };
}
