import { Router } from 'express';
import { PaymentController } from '../../controllers/payment.controller';
import { requireAuth } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/razorpay/create', requireAuth, PaymentController.createRazorpayOrder);
router.post('/razorpay/verify', requireAuth, PaymentController.verifyRazorpayPayment);
router.post('/simulate', requireAuth, PaymentController.processSimulatedPayment);

// Webhooks don't use standard auth middleware
router.post('/razorpay/webhook', PaymentController.razorpayWebhook);

export default router;
