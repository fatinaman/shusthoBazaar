import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { AuthenticatedRequest, Roles } from '../security/auth.guards.js';
import { parseInput } from '../common/validation.js';
import {
  createCouponAdmin,
  listAllDoctorsAdmin,
  listAllSellersAdmin,
  listAllUsers,
  listComplaintsAdmin,
  listCouponsAdmin,
  listReviewsAdmin,
  resolveComplaintAdmin,
  setUserActiveStatus,
  toggleCouponAdmin,
  toggleReviewVisibilityAdmin,
  verifyDoctorAccount,
  verifySellerAccount,
} from '../services/admin.service.js';

const verifySchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().trim().max(500).optional(),
});

const couponSchema = z.object({
  code: z.string().trim().min(3).max(30),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.coerce.number().positive(),
  minOrderAmt: z.coerce.number().min(0),
  validTo: z.string().min(4),
});

@Roles('admin')
@Controller('admin')
export class AdminController {
  @Get('users')
  users() {
    return { users: listAllUsers() };
  }

  @Patch('users/:id/status')
  toggleUser(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return setUserActiveStatus(Number(id), Boolean(isActive));
  }

  @Get('sellers')
  sellers() {
    return { sellers: listAllSellersAdmin() };
  }

  @Patch('sellers/:id/verify')
  verifySeller(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() body: unknown) {
    const input = parseInput(verifySchema, body);
    const adminId = (req.auth as any)?.id ?? (req.auth as any)?.userId ?? null;
    return verifySellerAccount(Number(id), adminId, input.status, input.reason);
  }

  @Get('doctors')
  doctors() {
    return { doctors: listAllDoctorsAdmin() };
  }

  @Patch('doctors/:id/verify')
  verifyDoctor(@Param('id') id: string, @Body() body: unknown) {
    const input = parseInput(verifySchema, body);
    return verifyDoctorAccount(Number(id), input.status, input.reason);
  }

  @Get('coupons')
  coupons() {
    return { coupons: listCouponsAdmin() };
  }

  @Post('coupons')
  createCoupon(@Body() body: unknown) {
    const input = parseInput(couponSchema, body);
    return createCouponAdmin(input);
  }

  @Patch('coupons/:id/status')
  toggleCoupon(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return toggleCouponAdmin(Number(id), Boolean(isActive));
  }

  @Get('reviews')
  reviews() {
    return { reviews: listReviewsAdmin() };
  }

  @Patch('reviews/:id/visibility')
  toggleReview(@Param('id') id: string, @Body('isVisible') isVisible: boolean) {
    return toggleReviewVisibilityAdmin(Number(id), Boolean(isVisible));
  }

  @Get('complaints')
  complaints() {
    return { complaints: listComplaintsAdmin() };
  }

  @Patch('complaints/:id/resolve')
  resolveComplaint(@Param('id') id: string, @Body('actionTaken') actionTaken: string) {
    return resolveComplaintAdmin(Number(id), actionTaken || 'Resolved by administrator');
  }
}