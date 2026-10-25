import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import {
  HttpError,
  getUserById,
  parseBody,
  publicCard,
  publicLink,
  publicTransaction,
  publicUser,
  wrap,
} from '../helpers.js';

export const accountRouter = Router();

accountRouter.get(
  '/me',
  requireAuth,
  wrap(async (req, res) => {
    const user = getUserById(req.userId);
    if (!user) throw new HttpError(401, 'Your account could not be found.');
    res.json({ user: publicUser(user) });
  }),
);

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(60),
  company: z.string().trim().max(60).optional().default(''),
  country: z.string().trim().max(60).optional().default(''),
});

accountRouter.patch(
  '/me',
  requireAuth,
  wrap(async (req, res) => {
    const data = parseBody(updateProfileSchema, req);
    db.prepare('UPDATE users SET name = ?, company = ?, country = ? WHERE id = ?').run(
      data.name,
      data.company || null,
      data.country || null,
      req.userId,
    );
    const user = getUserById(req.userId);
    res.json({ user: publicUser(user) });
  }),
);

accountRouter.get(
  '/dashboard',
  requireAuth,
  wrap(async (req, res) => {
    const user = getUserById(req.userId);
    if (!user) throw new HttpError(401, 'Your account could not be found.');

    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    ).toISOString();

    const month = db
      .prepare(
        `SELECT
           COALESCE(SUM(CASE WHEN amount_cents > 0 THEN amount_cents ELSE 0 END), 0) AS money_in,
           COALESCE(SUM(CASE WHEN amount_cents < 0 THEN -amount_cents ELSE 0 END), 0) AS money_out
         FROM transactions
         WHERE user_id = ? AND created_at >= ?`,
      )
      .get(req.userId, monthStart);

    const linkTotals = db
      .prepare(
        `SELECT
           COALESCE(SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END), 0) AS active_links,
           COALESCE(SUM(paid_count), 0) AS link_payments,
           COALESCE(SUM(total_collected_cents), 0) AS link_collected
         FROM payment_links WHERE user_id = ?`,
      )
      .get(req.userId);

    const startDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    startDate.setUTCDate(startDate.getUTCDate() - 29);

    const dailyRows = db
      .prepare(
        `SELECT
           substr(created_at, 1, 10) AS day,
           SUM(CASE WHEN amount_cents > 0 THEN amount_cents ELSE 0 END) AS in_cents,
           SUM(CASE WHEN amount_cents < 0 THEN -amount_cents ELSE 0 END) AS out_cents
         FROM transactions
         WHERE user_id = ? AND created_at >= ?
         GROUP BY day
         ORDER BY day ASC`,
      )
      .all(req.userId, startDate.toISOString());

    const byDay = new Map(dailyRows.map((row) => [row.day, row]));
    const cashflow = [];
    for (let i = 0; i < 30; i += 1) {
      const date = new Date(startDate.getTime() + i * 86_400_000);
      const key = date.toISOString().slice(0, 10);
      const row = byDay.get(key);
      cashflow.push({
        date: key,
        inCents: row ? Number(row.in_cents) : 0,
        outCents: row ? Number(row.out_cents) : 0,
      });
    }

    const recent = db
      .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 6')
      .all(req.userId)
      .map(publicTransaction);

    const cards = db
      .prepare('SELECT * FROM cards WHERE user_id = ? ORDER BY created_at ASC')
      .all(req.userId)
      .map(publicCard);

    const links = db
      .prepare('SELECT * FROM payment_links WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.userId)
      .map(publicLink);

    const contacts = db
      .prepare(
        `SELECT counterparty_name AS name, counterparty_email AS email, MAX(created_at) AS last_at
         FROM transactions
         WHERE user_id = ? AND type = 'send' AND counterparty_email IS NOT NULL
         GROUP BY LOWER(counterparty_email)
         ORDER BY last_at DESC
         LIMIT 4`,
      )
      .all(req.userId)
      .map((row) => ({
        name: row.name,
        email: row.email,
        lastAt: row.last_at,
        member: Boolean(
          db.prepare('SELECT 1 AS found FROM users WHERE email = ?').get(row.email),
        ),
      }));

    res.json({
      stats: {
        balanceCents: user.balance_cents,
        monthInCents: Number(month.money_in),
        monthOutCents: Number(month.money_out),
        activeLinks: Number(linkTotals.active_links),
        linkPayments: Number(linkTotals.link_payments),
        linkCollectedCents: Number(linkTotals.link_collected),
      },
      cashflow,
      recent,
      cards,
      links,
      contacts,
    });
  }),
);

accountRouter.get(
  '/contacts',
  requireAuth,
  wrap(async (req, res) => {
    const contacts = db
      .prepare(
        `SELECT counterparty_name AS name, counterparty_email AS email, MAX(created_at) AS last_at
         FROM transactions
         WHERE user_id = ? AND type = 'send' AND counterparty_email IS NOT NULL
         GROUP BY LOWER(counterparty_email)
         ORDER BY last_at DESC
         LIMIT 6`,
      )
      .all(req.userId)
      .map((row) => ({
        name: row.name,
        email: row.email,
        lastAt: row.last_at,
        member: Boolean(
          db.prepare('SELECT 1 AS found FROM users WHERE email = ?').get(row.email),
        ),
      }));
    res.json({ contacts });
  }),
);
