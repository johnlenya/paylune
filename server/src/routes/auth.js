import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { signToken } from '../auth.js';
import {
  HttpError,
  hashPassword,
  newId,
  newReference,
  parseBody,
  publicUser,
  verifyPassword,
  withTransaction,
  wrap,
} from '../helpers.js';

export const authRouter = Router();

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Please enter a valid email address.')
  .max(120);

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(60),
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Your password needs to be at least 8 characters.')
    .max(72, 'Your password is too long.'),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Please enter your password.').max(72),
});

authRouter.post(
  '/signup',
  wrap(async (req, res) => {
    const data = parseBody(signupSchema, req);
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existing) {
      throw new HttpError(409, 'An account with this email already exists. Try signing in.');
    }

    const id = newId('usr');
    const createdAt = new Date().toISOString();
    const startingBalance = 100000;

    withTransaction(() => {
      db.prepare(
        `INSERT INTO users
           (id, name, email, password_hash, company, country, balance_cents, created_at)
         VALUES (?, ?, ?, ?, NULL, NULL, ?, ?)`,
      ).run(id, data.name, data.email, hashPassword(data.password), startingBalance, createdAt);

      db.prepare(
        `INSERT INTO transactions
           (id, user_id, type, amount_cents, fee_cents, counterparty_name, counterparty_email,
            description, status, reference, group_id, created_at)
         VALUES (?, ?, 'topup', ?, 0, 'Paylune Demo', NULL,
            'Welcome to the demo — starting balance', 'completed', ?, NULL, ?)`,
      ).run(newId('txn'), id, startingBalance, newReference(), createdAt);
    });

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.status(201).json({ token: signToken(id), user: publicUser(user) });
  }),
);

authRouter.post(
  '/login',
  wrap(async (req, res) => {
    const data = parseBody(loginSchema, req);
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(data.email);
    if (!user || !verifyPassword(data.password, user.password_hash)) {
      throw new HttpError(401, 'Email or password is incorrect.');
    }
    res.json({ token: signToken(user.id), user: publicUser(user) });
  }),
);

authRouter.post(
  '/demo',
  wrap(async (_req, res) => {
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get('demo@paylune.app');
    if (!user) {
      throw new HttpError(404, 'The demo account is not available right now.');
    }
    res.json({ token: signToken(user.id), user: publicUser(user) });
  }),
);
