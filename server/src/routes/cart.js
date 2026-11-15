import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { parseProductId } from '../utils/ids.js';
import {
  addCartItem,
  applyCartCoupon,
  clearCartItems,
  getCart,
  removeCartCoupon,
  removeCartItem,
  updateCartItem,
} from '../services/cart.js';

const router = Router();
const addItemSchema = z.object({
  productId: z.string().regex(/^p\d{3,}$/i),
  quantity: z.coerce.number().int().min(1).max(1000).default(1),
});
const quantitySchema = z.object({ quantity: z.coerce.number().int().min(1).max(1000) });
const couponSchema = z.object({ code: z.string().trim().min(1).max(30) });
const customer = [requireAuth, requireRoles('customer')];

router.get('/', ...customer, (req, res) => res.json(getCart(req.auth.id)));

router.delete('/', ...customer, (req, res) => {
  clearCartItems(req.auth.id);
  return res.json(getCart(req.auth.id));
});

router.post('/items', ...customer, validate(addItemSchema), (req, res) => {
  addCartItem(req.auth.id, parseProductId(req.body.productId), req.body.quantity);
  return res.status(201).json(getCart(req.auth.id));
});

router.patch('/items/:productId', ...customer, validate(quantitySchema), (req, res) => {
  updateCartItem(req.auth.id, parseProductId(req.params.productId), req.body.quantity);
  return res.json(getCart(req.auth.id));
});

router.delete('/items/:productId', ...customer, (req, res) => {
  removeCartItem(req.auth.id, parseProductId(req.params.productId));
  return res.json(getCart(req.auth.id));
});

router.post('/coupon', ...customer, validate(couponSchema), (req, res) => {
  applyCartCoupon(req.auth.id, req.body.code);
  return res.json(getCart(req.auth.id));
});

router.delete('/coupon', ...customer, (req, res) => {
  removeCartCoupon(req.auth.id);
  return res.json(getCart(req.auth.id));
});

export default router;
