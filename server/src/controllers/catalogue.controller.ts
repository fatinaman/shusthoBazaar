import { Controller, Get, Param, Query } from '@nestjs/common';
import { z } from 'zod';
import { AppError } from '../middleware/errors.js';
import { getProduct, listCategories, listProducts } from '../services/catalogue.js';
import { parseProductId } from '../utils/ids.js';
import { parseInput } from '../common/validation.js';
import { Public } from '../security/auth.guards.js';

const querySchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  category: z.string().trim().max(100).optional().default(''),
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(100),
});

@Public()
@Controller()
export class CatalogueController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('categories')
  categories() {
    return { categories: listCategories() };
  }

  @Get('products')
  products(@Query() query: unknown) {
    const input = parseInput(querySchema, query);
    const result = listProducts(input);
    return {
      products: result.products,
      page: input.page,
      limit: input.limit,
      total: result.total,
    };
  }

  @Get('products/:id')
  product(@Param('id') rawId: string) {
    const product = getProduct(parseProductId(rawId));
    if (!product) throw new AppError(404, 'Product not found.');
    return product;
  }
}
