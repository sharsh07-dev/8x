import { Router } from 'express';
import { ShippingController } from '../../controllers/shipping.controller';
import { requireAuth } from '../../middlewares/authMiddleware';

const router = Router();

// Endpoint for checking delivery serviceability
// Using POST to allow passing complex cart weights, or GET with query params
router.post('/serviceability', ShippingController.checkServiceability);

// Webhook for Shiprocket status updates (no auth middleware because it's from external provider)
router.post('/webhook', ShippingController.shiprocketWebhook);

export default router;
