import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { AppError } from '../middleware/errors.js';
import { validate } from '../middleware/validate.js';
import { parseOrderId } from '../utils/ids.js';
import {
  advanceOrderStatus,
  getAuthorizedInvoice,
  getAuthorizedOrder,
  listOrders,
} from '../services/orderOperations.js';

const router = Router();
const statusSchema = z.object({
  status: z.enum(['confirmed', 'out_for_delivery', 'delivered']),
});
const authenticated = [requireAuth, requireRoles('customer', 'seller', 'admin')];
const canAdvanceStatus = [requireAuth, requireRoles('seller', 'admin')];

function parseId(req, res, next) {
  try {
    req.orderId = parseOrderId(req.params.id);
    return next();
  } catch (error) {
    return next(error);
  }
}

router.get('/', ...authenticated, (req, res) => res.json({ orders: listOrders(req.auth) }));

router.patch('/:id/status', ...canAdvanceStatus, parseId, validate(statusSchema), (req, res) => {
  const order = advanceOrderStatus(req.orderId, req.body.status, req.auth);
  return res.json({ order });
});

router.get('/:id/invoice', ...authenticated, parseId, (req, res) => {
  return res.json(getAuthorizedInvoice(req.orderId, req.auth));
});

router.get('/:id', ...authenticated, parseId, (req, res) => {
  const order = getAuthorizedOrder(req.orderId, req.auth);
  return res.json(order);
});

router.use((req, res, next) => next(new AppError(404, 'Order route not found.')));

export default router;
