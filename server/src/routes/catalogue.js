import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../middleware/errors.js';
import { validate } from '../middleware/validate.js';
import { getProduct, listCategories, listProducts } from '../services/catalogue.js';
import { parseProductId } from '../utils/ids.js';

const router = Router();
const querySchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  category: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
});

router.get('/categories', (req, res) => res.json({ categories: listCategories() }));

router.get('/products', validate(querySchema, 'query'), (req, res) => {
  const query = req.validated.query;
  const result = listProducts(query);
  return res.json({
    products: result.products,
    page: query.page,
    limit: query.limit,
    total: result.total,
  });
});

router.get('/products/:id', (req, res, next) => {
  try {
    const product = getProduct(parseProductId(req.params.id));
    if (!product) return next(new AppError(404, 'Product not found.'));
    return res.json(product);
  } catch (error) {
    return next(error);
  }
});

export default router;
