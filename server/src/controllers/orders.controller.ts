import { Body, Controller, Get, Param, Patch, Req } from '@nestjs/common';
import { z } from 'zod';
import {
  advanceOrderStatus,
  getAuthorizedInvoice,
  getAuthorizedOrder,
  listOrders,
} from '../services/orderOperations.js';
import { parseOrderId } from '../utils/ids.js';
import { AuthenticatedRequest, Roles } from '../security/auth.guards.js';
import { parseInput } from '../common/validation.js';

const statusSchema = z.object({
  status: z.enum(['confirmed', 'out_for_delivery', 'delivered']),
});

@Roles('customer', 'seller', 'admin')
@Controller('orders')
export class OrdersController {
  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return { orders: listOrders(request.auth!) };
  }

  @Patch(':id/status')
  @Roles('seller', 'admin')
  updateStatus(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const input = parseInput(statusSchema, body);
    return { order: advanceOrderStatus(parseOrderId(id), input.status, request.auth!) };
  }

  @Get(':id/invoice')
  invoice(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return getAuthorizedInvoice(parseOrderId(id), request.auth!);
  }

  @Get(':id')
  detail(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return getAuthorizedOrder(parseOrderId(id), request.auth!);
  }
}
