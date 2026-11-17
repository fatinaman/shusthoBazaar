import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import {
  addCartItem,
  applyCartCoupon,
  clearCartItems,
  getCart,
  removeCartCoupon,
  removeCartItem,
  updateCartItem,
} from '../services/cart.js';
import { parseProductId } from '../utils/ids.js';
import { AuthenticatedRequest, Roles } from '../security/auth.guards.js';
import { parseInput } from '../common/validation.js';

const addItemSchema = z.object({
  productId: z.string().regex(/^p\d{3,}$/i),
  quantity: z.coerce.number().int().min(1).max(1000).default(1),
});
const quantitySchema = z.object({ quantity: z.coerce.number().int().min(1).max(1000) });
const couponSchema = z.object({ code: z.string().trim().min(1).max(30) });

@Roles('customer')
@Controller('cart')
export class CartController {
  @Get()
  get(@Req() request: AuthenticatedRequest) {
    return getCart(request.auth!.id);
  }

  @Delete()
  clear(@Req() request: AuthenticatedRequest) {
    clearCartItems(request.auth!.id);
    return getCart(request.auth!.id);
  }

  @Post('items')
  add(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = parseInput(addItemSchema, body);
    addCartItem(request.auth!.id, parseProductId(input.productId), input.quantity);
    return getCart(request.auth!.id);
  }

  @Patch('items/:productId')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('productId') productId: string,
    @Body() body: unknown,
  ) {
    const input = parseInput(quantitySchema, body);
    updateCartItem(request.auth!.id, parseProductId(productId), input.quantity);
    return getCart(request.auth!.id);
  }

  @Delete('items/:productId')
  remove(@Req() request: AuthenticatedRequest, @Param('productId') productId: string) {
    removeCartItem(request.auth!.id, parseProductId(productId));
    return getCart(request.auth!.id);
  }

  @Post('coupon')
  @HttpCode(200)
  applyCoupon(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = parseInput(couponSchema, body);
    applyCartCoupon(request.auth!.id, input.code);
    return getCart(request.auth!.id);
  }

  @Delete('coupon')
  removeCoupon(@Req() request: AuthenticatedRequest) {
    removeCartCoupon(request.auth!.id);
    return getCart(request.auth!.id);
  }
}
