import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { completeMockPayment } from '../services/mockPayments.js';
import { AuthenticatedRequest, Roles } from '../security/auth.guards.js';
import { parseInput } from '../common/validation.js';

const completionSchema = z.object({
  checkoutReference: z.string().regex(/^SB-CHECKOUT-[a-f0-9-]{36}$/i),
  result: z.enum(['success', 'failed']),
});

@Roles('customer')
@Controller('payments')
export class PaymentsController {
  @Post('mock/complete')
  @HttpCode(200)
  complete(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = parseInput(completionSchema, body);
    return completeMockPayment(input.checkoutReference, request.auth!.id, input.result);
  }
}
