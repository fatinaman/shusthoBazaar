import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import bcrypt from 'bcrypt';
import type { Response } from 'express';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { AppError } from '../middleware/errors.js';
import {
  clearAuthCookie,
  issueAuthCookie,
  publicUser,
  Public,
  AuthenticatedRequest,
} from '../security/auth.guards.js';
import { parseInput } from '../common/validation.js';

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  phone: z.string().trim().min(7).max(20).optional(),
});
const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

type AuthDatabaseUser = {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: string;
  seller_id: number | null;
  pharmacy_name: string | null;
};

const findUser = db.prepare(`
  SELECT u.id, u.full_name, u.email, u.phone, u.password_hash,
         r.name AS role, s.id AS seller_id, s.pharmacy_name
  FROM users u
  JOIN roles r ON r.id = u.role_id
  LEFT JOIN sellers s ON s.user_id = u.id
  WHERE lower(u.email) = lower(?) AND u.is_active = 1
`);

@Controller('auth')
export class AuthController {
  @Public()
  @Post('register')
  register(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const input = parseInput(registerSchema, body);
    const existing = db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(input.email);
    if (existing) throw new AppError(409, 'An account with that email already exists.');

    try {
      const customerRoleId = db.prepare("SELECT id FROM roles WHERE name = 'customer'").get()?.id;
      if (!customerRoleId) throw new Error('Customer role is missing from the database seed.');
      const passwordHash = bcrypt.hashSync(input.password, 12);
      const result = db.prepare(
        'INSERT INTO users (role_id, full_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)',
      ).run(customerRoleId, input.name, input.email, input.phone || null, passwordHash);
      const user = findUser.get(input.email) as AuthDatabaseUser | undefined;
      if (!user) throw new Error('Registered account could not be loaded.');
      issueAuthCookie(response, Number(result.lastInsertRowid));
      return { user: publicUser(user) };
    } catch (error) {
      if ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new AppError(409, 'An account with that email or phone already exists.');
      }
      throw error;
    }
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const input = parseInput(loginSchema, body);
    const row = findUser.get(input.email) as AuthDatabaseUser | undefined;
    if (!row || !bcrypt.compareSync(input.password, row.password_hash)) {
      throw new AppError(401, 'Email or password is incorrect.');
    }
    issueAuthCookie(response, row.id);
    return { user: publicUser(row) };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    clearAuthCookie(response);
    return { success: true };
  }

  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return { user: request.auth!.user };
  }
}
