import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../middlewares/errorHandler';

export class ReviewController {
  /**
   * Get paginated reviews for a product, along with rating distribution.
   */
  static async getProductReviews(req: Request, res: Response) {
    const productId = req.params.productId as string;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Ensure product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'helpful') {
      orderBy = [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'rating_high') {
      orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'rating_low') {
      orderBy = [{ rating: 'asc' }, { createdAt: 'desc' }];
    }

    // Fetch reviews
    const [reviews, totalReviews, ratingAggregations] = await Promise.all([
      prisma.review.findMany({
        where: { productId, status: 'PUBLISHED' },
        include: {
          user: { select: { id: true, name: true, image: true } }
        },
        orderBy,
        skip,
        take: Number(limit)
      }),
      prisma.review.count({ where: { productId, status: 'PUBLISHED' } }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId, status: 'PUBLISHED' },
        _count: { _all: true }
      })
    ]);

    // Calculate average rating and distribution
    let totalScore = 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    ratingAggregations.forEach(agg => {
      const count = agg._count._all;
      const score = agg.rating * count;
      totalScore += score;
      distribution[agg.rating as keyof typeof distribution] = count;
    });

    const averageRating = totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        total: totalReviews,
        page: Number(page),
        limit: Number(limit),
        stats: {
          averageRating,
          distribution
        }
      }
    });
  }

  /**
   * Create or update a review. Automatically detects "Verified Purchase".
   */
  static async submitReview(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId, rating, title, body } = req.body;

    if (!productId || !rating || !title || !body) {
      throw new AppError('Missing required fields', 400);
    }

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if the user actually purchased the product
    const previousOrder = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        }
      },
      orderBy: { order: { createdAt: 'desc' } }
    });

    const verifiedPurchase = !!previousOrder;

    const review = await prisma.review.upsert({
      where: {
        userId_productId: { userId, productId }
      },
      create: {
        userId,
        productId,
        rating,
        title,
        body,
        verifiedPurchase,
        orderItemId: previousOrder ? previousOrder.id : null,
        status: 'PUBLISHED'
      },
      update: {
        rating,
        title,
        body,
        verifiedPurchase, // in case they bought it since their last review attempt
        orderItemId: previousOrder ? previousOrder.id : null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } }
      }
    });

    res.status(201).json({ success: true, data: { review } });
  }

  /**
   * Mark a review as helpful.
   */
  static async markHelpful(req: Request, res: Response) {
    const userId = req.user!.id;
    const reviewId = req.params.id as string;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new AppError('Review not found', 404);
    }

    if (review.userId === userId) {
      throw new AppError('You cannot vote on your own review', 400);
    }

    const existingVote = await prisma.reviewHelpfulVote.findUnique({
      where: { reviewId_userId: { reviewId, userId } }
    });

    if (existingVote) {
      // Toggle off (remove vote)
      await prisma.$transaction([
        prisma.reviewHelpfulVote.delete({ where: { id: existingVote.id } }),
        prisma.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { decrement: 1 } }
        })
      ]);
      return res.status(200).json({ success: true, message: 'Vote removed' });
    } else {
      // Toggle on (add vote)
      await prisma.$transaction([
        prisma.reviewHelpfulVote.create({
          data: { reviewId, userId }
        }),
        prisma.review.update({
          where: { id: reviewId },
          data: { helpfulCount: { increment: 1 } }
        })
      ]);
      return res.status(200).json({ success: true, message: 'Vote added' });
    }
  }
}
