import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { requireAuth } from '../../middlewares/authMiddleware';
import { validateRequest } from '../../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();

// Validation Schemas
const sessionSchema = z.object({
  body: z.object({
    idToken: z.string({ message: 'idToken is required' }),
  }),
});

const addressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(4),
    country: z.string().optional(),
    phone: z.string().optional(),
    isDefault: z.boolean().optional(),
    instructions: z.string().optional(),
  }),
});

// Auth Routes
router.post('/session', validateRequest(sessionSchema), AuthController.createSession);
router.post('/logout', AuthController.logout);
router.get('/me', requireAuth, AuthController.getMe);

// Address Management Routes
router.get('/addresses', requireAuth, AuthController.getAddresses);
router.post('/addresses', requireAuth, validateRequest(addressSchema), AuthController.addAddress);
router.put('/addresses/:id', requireAuth, AuthController.updateAddress);
router.delete('/addresses/:id', requireAuth, AuthController.deleteAddress);

export default router;
