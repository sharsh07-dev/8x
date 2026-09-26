import { Router } from 'express';
import healthRoutes from './health';
import authRoutes from './auth';
import catalogRoutes from './catalog';
import cartRoutes from './cart';
import orderRoutes from './orders';
import paymentRoutes from './payments';
import reviewRoutes from './reviews';
import shippingRoutes from './shipping';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/catalog', catalogRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/shipping', shippingRoutes);
// Further routes will be added here:
// router.use('/catalog', catalogRoutes);
// router.use('/cart', cartRoutes);
// router.use('/checkout', checkoutRoutes);

export default router;
