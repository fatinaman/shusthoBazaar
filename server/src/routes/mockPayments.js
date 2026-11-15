import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { completeMockPayment } from '../services/mockPayments.js';

const router = Router();
const completionSchema = z.object({
  checkoutReference: z.string().regex(/^SB-CHECKOUT-[a-f0-9-]{36}$/i),
  result: z.enum(['success', 'failed']),
});

router.post('/mock/complete', requireAuth, requireRoles('customer'), validate(completionSchema), (req, res) => {
  const result = completeMockPayment(
    req.body.checkoutReference,
    req.auth.id,
    req.body.result,
  );
  return res.json(result);
});

export default router;
