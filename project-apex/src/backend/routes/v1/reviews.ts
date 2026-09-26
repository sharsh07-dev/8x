import { Router } from 'express';
import { ReviewController } from '../../controllers/review.controller';
import { requireAuth } from '../../middlewares/authMiddleware';

const router = Router();

// Public routes
router.get('/:productId', ReviewController.getProductReviews);

// Protected routes
router.use(requireAuth);
router.post('/', ReviewController.submitReview);
router.post('/:id/helpful', ReviewController.markHelpful);

export default router;
