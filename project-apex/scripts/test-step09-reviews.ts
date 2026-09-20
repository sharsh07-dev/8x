/**
 * Automated Verification Suite for Step 09: Customer Reviews & Ratings System
 */

import { prisma } from '../src/lib/prisma';
import { calculateRatingSummary, checkVerifiedPurchase } from '../src/lib/reviews/eligibility';

async function runReviewTests() {
  console.log('====================================================');
  console.log('Starting Step 09 Customer Reviews Verification Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const testProductId = 'prod-1'; // Wireless Headphones
  const testUserEmail = `review_tester_${Date.now()}@example.com`;

  try {
    // 1. Test Empty Rating Summary Calculation
    const emptySummary = await calculateRatingSummary('non-existent-prod-xyz');
    if (emptySummary.averageRating === 0 && emptySummary.totalReviews === 0 && !emptySummary.hasReviews) {
      console.log('✅ [PASS] Empty product reviews return zeroed summary');
      passed++;
    } else {
      console.error('❌ [FAIL] Empty product reviews returned unexpected summary:', emptySummary);
      failed++;
    }

    // 2. Create a test customer in apex_db
    const user = await prisma.user.create({
      data: {
        name: 'Alex Rivera',
        email: testUserEmail,
        emailVerified: true,
      },
    });
    console.log(`✅ [PASS] Created test user: ${user.email} (${user.id})`);
    passed++;

    // 3. Verified Purchase should initially be false (no order placed)
    const verifiedBeforeOrder = await checkVerifiedPurchase(user.id, testProductId);
    if (!verifiedBeforeOrder) {
      console.log('✅ [PASS] checkVerifiedPurchase returns false when no order exists');
      passed++;
    } else {
      console.error('❌ [FAIL] checkVerifiedPurchase returned true prematurely');
      failed++;
    }

    // 4. Create an order with prod-1 for this user
    const order = await prisma.order.create({
      data: {
        orderNumber: `APX-REV-${Date.now()}`,
        userId: user.id,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        subtotal: 199.99,
        total: 199.99,
        estimatedDelivery: 'Tomorrow by 9 PM',
        items: {
          create: {
            productId: testProductId,
            productTitle: 'Apex Noise Cancelling Headphones',
            productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            unitPrice: 199.99,
            quantity: 1,
            lineTotal: 199.99,
          },
        },
      },
    });
    console.log(`✅ [PASS] Created qualifying order: ${order.orderNumber}`);
    passed++;

    // 5. Verified Purchase should now be true
    const verifiedAfterOrder = await checkVerifiedPurchase(user.id, testProductId);
    if (verifiedAfterOrder) {
      console.log('✅ [PASS] checkVerifiedPurchase returns true for customer with qualifying order');
      passed++;
    } else {
      console.error('❌ [FAIL] checkVerifiedPurchase failed to recognize qualifying order');
      failed++;
    }

    // 6. Create Review with Verified Purchase badge
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId: testProductId,
        rating: 5,
        title: 'Outstanding sound quality and battery life!',
        body: 'The active noise cancellation is unmatched at this price point. Comfortable for all-day wear.',
        verifiedPurchase: verifiedAfterOrder,
        status: 'PUBLISHED',
      },
    });
    console.log(`✅ [PASS] Created published review: ${review.id} with verifiedPurchase=${review.verifiedPurchase}`);
    passed++;

    // 7. Duplicate review constraint test (should throw on @@unique([userId, productId]))
    try {
      await prisma.review.create({
        data: {
          userId: user.id,
          productId: testProductId,
          rating: 4,
          title: 'Second review attempt',
          body: 'This should fail due to unique constraint.',
        },
      });
      console.error('❌ [FAIL] Duplicate review creation should have been prevented');
      failed++;
    } catch (dupErr: any) {
      console.log('✅ [PASS] Database unique constraint prevented duplicate review');
      passed++;
    }

    // 8. Rating Summary calculation after review
    const updatedSummary = await calculateRatingSummary(testProductId);
    if (updatedSummary.hasReviews && updatedSummary.totalReviews >= 1 && updatedSummary.averageRating > 0) {
      console.log(`✅ [PASS] calculateRatingSummary correctly aggregated reviews: ${updatedSummary.averageRating}★ (${updatedSummary.totalReviews} reviews)`);
      passed++;
    } else {
      console.error('❌ [FAIL] Summary calculation after review failed:', updatedSummary);
      failed++;
    }

    // 9. Helpful Voting & Duplicate Vote Prevention
    const voter = await prisma.user.create({
      data: {
        name: 'Jordan Lee',
        email: `voter_${Date.now()}@example.com`,
        emailVerified: true,
      },
    });

    // Cast vote
    const vote = await prisma.reviewHelpfulVote.create({
      data: {
        reviewId: review.id,
        userId: voter.id,
      },
    });
    await prisma.review.update({
      where: { id: review.id },
      data: { helpfulCount: { increment: 1 } },
    });
    console.log(`✅ [PASS] Recorded helpful vote: ${vote.id}`);
    passed++;

    // Duplicate vote should fail on @@unique([reviewId, userId])
    try {
      await prisma.reviewHelpfulVote.create({
        data: {
          reviewId: review.id,
          userId: voter.id,
        },
      });
      console.error('❌ [FAIL] Duplicate vote should have thrown unique violation');
      failed++;
    } catch (dupVoteErr) {
      console.log('✅ [PASS] Unique constraint prevented duplicate helpful vote');
      passed++;
    }

    // 10. Abuse Report Submission
    const report = await prisma.reviewReport.create({
      data: {
        reviewId: review.id,
        userId: voter.id,
        reason: 'Spam or promotional content',
        details: 'Review test report verification',
      },
    });
    console.log(`✅ [PASS] Created review report: ${report.id} with status=${report.status}`);
    passed++;

    // 11. Review Edit
    const editedReview = await prisma.review.update({
      where: { id: review.id },
      data: {
        rating: 4,
        title: 'Updated title: Excellent ANC',
      },
    });
    if (editedReview.rating === 4 && editedReview.title === 'Updated title: Excellent ANC') {
      console.log('✅ [PASS] Successfully updated customer review');
      passed++;
    } else {
      console.error('❌ [FAIL] Review update failed:', editedReview);
      failed++;
    }

    // 12. Review Deletion
    await prisma.review.delete({
      where: { id: review.id },
    });
    const deletedCheck = await prisma.review.findUnique({ where: { id: review.id } });
    if (!deletedCheck) {
      console.log('✅ [PASS] Successfully deleted customer review');
      passed++;
    } else {
      console.error('❌ [FAIL] Review still exists after delete');
      failed++;
    }

    // Clean up test data
    await prisma.reviewHelpfulVote.deleteMany({ where: { userId: voter.id } });
    await prisma.reviewReport.deleteMany({ where: { userId: voter.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
    await prisma.order.delete({ where: { id: order.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.user.delete({ where: { id: voter.id } });
    console.log('✅ [PASS] Cleaned up temporary test records');
    passed++;

  } catch (err: any) {
    console.error('Unexpected test failure:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runReviewTests().catch((err) => {
  console.error('Fatal error running reviews test suite:', err);
  process.exit(1);
});
