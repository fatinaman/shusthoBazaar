import jwt from 'jsonwebtoken';
import { db } from '../../db/index.js';
import { config } from '../../config/index.js';
import { AppError } from './errors.js';

const userQuery = db.prepare(`
  SELECT u.id, u.full_name, u.email, u.phone, r.name AS role,
         s.id AS seller_id, s.pharmacy_name
  FROM users u
  JOIN roles r ON r.id = u.role_id
  LEFT JOIN sellers s ON s.user_id = u.id
  WHERE u.id = ? AND u.is_active = 1
`);

function readCookie(req, name) {
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

export function publicUser(row) {
  const demoIds = {
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

export function issueAuthCookie(res, userId) {
  const token = jwt.sign({}, config.jwtSecret, { subject: String(userId), expiresIn: '7d' });
  res.cookie('sb_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie('sb_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization;
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = bearer || readCookie(req, 'sb_session');
  if (!token) return next(new AppError(401, 'Authentication required.'));

  let claims;
  try {
    claims = jwt.verify(token, config.jwtSecret);
  } catch {
    return next(new AppError(401, 'Authentication token is invalid or expired.'));
  }

  const row = userQuery.get(Number(claims.sub));
  if (!row) return next(new AppError(401, 'User account is unavailable.'));
  req.auth = {
    id: row.id,
    role: row.role,
    sellerId: row.seller_id,
    user: publicUser(row),
  };
  return next();
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.auth) return next(new AppError(401, 'Authentication required.'));
    if (!roles.includes(req.auth.role)) return next(new AppError(403, 'You are not allowed to perform this action.'));
    return next();
  };
}
