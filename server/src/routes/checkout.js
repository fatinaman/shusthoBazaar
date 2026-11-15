import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrdersFromCart } from '../services/checkout.js';

const router = Router();
const checkoutSchema = z.object({
  addressId: z.string().regex(/^addr-\d+$/i),
  paymentMethod: z.enum(['cod', 'mock']),
});

router.post('/', requireAuth, requireRoles('customer'), validate(checkoutSchema), (req, res) => {
  const result = createOrdersFromCart(req.auth.id, req.body);
  return res.status(201).json({
    orders: result.orders,
    checkoutReference: result.checkoutReference,
    paymentStatus: 'pending',
  });
});

export default router;
