import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest, Roles } from '../security/auth.guards.js';
import { resolveSellerScope } from '../services/sellers.js';
import { parseSellerId } from '../utils/ids.js';
import { parseInput } from '../common/validation.js';
import { generateAnalyticsCsv, getAnalyticsOverview } from '../services/analytics.service.js';

const scopeSchema = z.object({
  sellerId: z.string().regex(/^s\d+$/i).optional(),
});

@Roles('seller', 'admin')
@Controller('analytics')
export class AnalyticsController {
  @Get('overview')
  overview(@Req() request: AuthenticatedRequest, @Query() query: unknown) {
    const input = parseInput(scopeSchema, query);
    const sellerId = resolveSellerScope(request.auth!, input.sellerId ? parseSellerId(input.sellerId) : null);
    return getAnalyticsOverview(sellerId);
  }

  @Get('export/csv')
  exportCsv(@Req() request: AuthenticatedRequest, @Query() query: unknown, @Res() res: Response) {
    const input = parseInput(scopeSchema, query);
    const sellerId = resolveSellerScope(request.auth!, input.sellerId ? parseSellerId(input.sellerId) : null);
    const csv = generateAnalyticsCsv(sellerId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="shusthobazaar-analytics.csv"');
    res.send(csv);
  }
}