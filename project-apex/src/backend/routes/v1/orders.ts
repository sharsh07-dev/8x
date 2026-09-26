import { Router } from 'express';
import { OrderController } from '../../controllers/order.controller';
import { requireAuth, requireRole } from '../../middlewares/authMiddleware';

const router = Router();

// All order routes require an authenticated user
router.use(requireAuth);

// Admin Routes
router.get('/admin', requireRole('ADMIN'), OrderController.getAllOrders);
router.patch('/admin/:id/status', requireRole('ADMIN'), OrderController.updateOrderStatus);

// User Routes
router.get('/', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);
router.get('/:id/tracking', OrderController.getOrderTracking);

// Order actions
router.post('/init', OrderController.initializeOrder);
router.post('/:id/confirm', OrderController.confirmOrder);
router.post('/:id/cancel', OrderController.cancelOrder);

export default router;
