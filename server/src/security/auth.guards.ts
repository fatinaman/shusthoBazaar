import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { db } from '../../db/index.js';
import { config } from '../../config/index.js';
import { AppError } from '../middleware/errors.js';

const PUBLIC_ROUTE = 'isPublic';
const REQUIRED_ROLES = 'requiredRoles';

export const Public = () => SetMetadata(PUBLIC_ROUTE, true);
export const Roles = (...roles: string[]) => SetMetadata(REQUIRED_ROLES, roles);

export type AuthUser = {
  id: number;
  role: string;
  sellerId: number | null;
  user: ReturnType<typeof publicUser>;
};

export type AuthenticatedRequest = Request & { auth?: AuthUser };
type UserRow = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  seller_id: number | null;
  pharmacy_name: string | null;
};

const userQuery = db.prepare(`
  SELECT u.id, u.full_name, u.email, u.phone, r.name AS role,
         s.id AS seller_id, s.pharmacy_name
  FROM users u
  JOIN roles r ON r.id = u.role_id
  LEFT JOIN sellers s ON s.user_id = u.id
  WHERE u.id = ? AND u.is_active = 1
`);

function readCookie(request: Request, name: string) {
  const cookie = request.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

export function publicUser(row: UserRow) {
  const demoIds: Record<string, string> = {
    'customer@shusthobazaar.demo': 'demo-customer',
    'seller@shusthobazaar.demo': 'demo-seller',
    'admin@shusthobazaar.demo': 'demo-admin',
  };
  return {
    id: demoIds[row.email] || `u${row.id}`,
    name: row.full_name,
    email: row.email,
    role: row.role,
    sellerId: row.seller_id ? `s${String(row.seller_id).padStart(3, '0')}` : null,
    storeName: row.pharmacy_name || null,
  };
}

export function issueAuthCookie(response: Response, userId: number) {
  const token = jwt.sign({}, config.jwtSecret, { subject: String(userId), expiresIn: '7d' });
  response.cookie('sb_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(response: Response) {
  response.clearCookie('sb_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    const token = bearer || readCookie(request, 'sb_session');
    if (!token) throw new AppError(401, 'Authentication required.');

    let claims: jwt.JwtPayload;
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      if (typeof decoded === 'string' || !decoded.sub) throw new Error('Invalid JWT subject');
      claims = decoded;
    } catch {
      throw new AppError(401, 'Authentication token is invalid or expired.');
    }

    const row = userQuery.get(Number(claims.sub)) as UserRow | undefined;
    if (!row) throw new AppError(401, 'User account is unavailable.');
    request.auth = {
      id: row.id,
      role: row.role,
      sellerId: row.seller_id,
      user: publicUser(row),
    };
    return true;
  }
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<string[]>(REQUIRED_ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.auth) throw new AppError(401, 'Authentication required.');
    if (!roles.includes(request.auth.role)) {
      throw new AppError(403, 'You are not allowed to perform this action.');
    }
    return true;
  }
}
