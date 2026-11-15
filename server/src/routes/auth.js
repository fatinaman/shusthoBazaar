import { Router } from 'express';
import bcrypt from 'bcrypt';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { publicUser, issueAuthCookie, clearAuthCookie, requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errors.js';
import { validate } from '../middleware/validate.js';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});
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

const findUser = db.prepare(`
  SELECT u.id, u.full_name, u.email, u.phone, u.password_hash,
         r.name AS role, s.id AS seller_id, s.pharmacy_name
  FROM users u
  JOIN roles r ON r.id = u.role_id
  LEFT JOIN sellers s ON s.user_id = u.id
  WHERE lower(u.email) = lower(?) AND u.is_active = 1
`);

router.post('/register', loginLimiter, validate(registerSchema), (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const existing = db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(email);
  if (existing) return next(new AppError(409, 'An account with that email already exists.'));

  try {
    const customerRoleId = db.prepare("SELECT id FROM roles WHERE name = 'customer'").get()?.id;
    if (!customerRoleId) throw new Error('Customer role is missing from the database seed.');
    const passwordHash = bcrypt.hashSync(password, 12);
    const result = db.prepare(
      'INSERT INTO users (role_id, full_name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)',
    ).run(customerRoleId, name, email, phone || null, passwordHash);
    const user = findUser.get(email);
    issueAuthCookie(res, Number(result.lastInsertRowid));
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return next(new AppError(409, 'An account with that email or phone already exists.'));
    }
    return next(error);
  }
});

router.post('/login', loginLimiter, validate(loginSchema), (req, res, next) => {
  const row = findUser.get(req.body.email);
  if (!row || !bcrypt.compareSync(req.body.password, row.password_hash)) {
    return next(new AppError(401, 'Email or password is incorrect.'));
  }
  issueAuthCookie(res, row.id);
  return res.json({ user: publicUser(row) });
});

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true });
});

router.get('/me', requireAuth, (req, res) => res.json({ user: req.auth.user }));

export default router;
