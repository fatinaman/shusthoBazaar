import { Body, Controller, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { createOrdersFromCart } from '../services/checkout.js';
import { AuthenticatedRequest, Roles } from '../security/auth.guards.js';
import { parseInput } from '../common/validation.js';

const checkoutSchema = z.object({
  addressId: z.string().regex(/^addr-\d+$/i),
  paymentMethod: z.enum(['cod', 'mock']),
});

@Roles('customer')
@Controller('checkout')
export class CheckoutController {
  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = parseInput(checkoutSchema, body);
    const result = createOrdersFromCart(request.auth!.id, input);
    return {
      orders: result.orders,
      checkoutReference: result.checkoutReference,
      paymentStatus: 'pending',
    };
  }
}
