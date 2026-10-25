import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import {
  HttpError,
  getUserById,
  makeSlug,
  newId,
  newReference,
  parseBody,
  publicLink,
  withTransaction,
  wrap,
} from '../helpers.js';

export const linksRouter = Router();

linksRouter.get(
  '/links',
  requireAuth,
  wrap(async (req, res) => {
    const links = db
      .prepare('SELECT * FROM payment_links WHERE user_id = ? ORDER BY created_at DESC')
      .all(req.userId)
      .map(publicLink);
    res.json({ links });
  }),
);

const createLinkSchema = z.object({
  title: z.string().trim().min(3, 'Give your link a title.').max(80),
  description: z
    .string()
    .trim()
    .max(240, 'Keep the description under 240 characters.')
    .optional()
    .default(''),
  amountCents: z
    .number()
    .int()
    .min(100, 'The minimum amount is $1.00.')
    .max(5000000, 'Payment links are limited to $50,000.00 in this demo.')
    .nullable()
    .optional()
    .default(null),
  active: z.boolean().optional().default(true),
});

linksRouter.post(
  '/links',
  requireAuth,
  wrap(async (req, res) => {
    const data = parseBody(createLinkSchema, req);
    const id = newId('link');

    let slug = makeSlug(data.title);
    let attempts = 0;
    while (db.prepare('SELECT 1 AS found FROM payment_links WHERE slug = ?').get(slug)) {
      attempts += 1;
      if (attempts > 5) throw new HttpError(500, 'Could not create a unique link.');
      slug = makeSlug(data.title);
    }

    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO payment_links
         (id, user_id, slug, title, description, amount_cents, active, paid_count,
          total_collected_cents, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?)`,
    ).run(
      id,
      req.userId,
      slug,
      data.title,
      data.description,
      data.amountCents,
      data.active ? 1 : 0,
      now,
    );

    const link = db.prepare('SELECT * FROM payment_links WHERE id = ?').get(id);
    res.status(201).json({ link: publicLink(link) });
  }),
);

const updateLinkSchema = z.object({
  active: z.boolean({ invalid_type_error: 'Invalid link state.' }),
});

linksRouter.patch(
  '/links/:id',
  requireAuth,
  wrap(async (req, res) => {
    const data = parseBody(updateLinkSchema, req);
    const link = db
      .prepare('SELECT * FROM payment_links WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId);
    if (!link) throw new HttpError(404, 'Payment link not found.');

    db.prepare('UPDATE payment_links SET active = ? WHERE id = ?').run(
      data.active ? 1 : 0,
      link.id,
    );
    const updated = db.prepare('SELECT * FROM payment_links WHERE id = ?').get(link.id);
    res.json({ link: publicLink(updated) });
  }),
);

linksRouter.get(
  '/pay/:slug',
  wrap(async (req, res) => {
    const row = db
      .prepare(
        `SELECT l.*, u.name AS owner_name, u.company AS owner_company
         FROM payment_links l
         JOIN users u ON u.id = l.user_id
         WHERE l.slug = ?`,
      )
      .get(req.params.slug);

    if (!row) throw new HttpError(404, 'This payment link could not be found.');

    res.json({
      link: {
        slug: row.slug,
        title: row.title,
        description: row.description,
        amountCents: row.amount_cents,
        active: Boolean(row.active),
        paidCount: row.paid_count,
        ownerName: row.owner_name,
        ownerCompany: row.owner_company,
      },
    });
  }),
);

const publicPaySchema = z.object({
  payerName: z.string().trim().min(2, 'Please enter your name.').max(60),
  payerEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address.')
    .max(120),
  amountCents: z.number().int().optional(),
});

linksRouter.post(
  '/pay/:slug',
  wrap(async (req, res) => {
    const data = parseBody(publicPaySchema, req);
    const row = db
      .prepare(
        `SELECT l.*, u.name AS owner_name, u.company AS owner_company
         FROM payment_links l
         JOIN users u ON u.id = l.user_id
         WHERE l.slug = ?`,
      )
      .get(req.params.slug);

    if (!row) throw new HttpError(404, 'This payment link could not be found.');
    if (!row.active) {
      throw new HttpError(400, 'This payment link is no longer accepting payments.');
    }

    const amountCents = row.amount_cents ?? data.amountCents;
    if (!Number.isInteger(amountCents) || amountCents < 100 || amountCents > 5000000) {
      throw new HttpError(400, 'Please enter an amount between $1.00 and $50,000.00.');
    }

    const reference = newReference();
    const paidAt = new Date().toISOString();

    withTransaction(() => {
      db.prepare('UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?').run(
        amountCents,
        row.user_id,
      );
      db.prepare(
        `UPDATE payment_links
         SET paid_count = paid_count + 1, total_collected_cents = total_collected_cents + ?
         WHERE id = ?`,
      ).run(amountCents, row.id);
      db.prepare(
        `INSERT INTO transactions
           (id, user_id, type, amount_cents, fee_cents, counterparty_name, counterparty_email,
            description, status, reference, group_id, created_at)
         VALUES (?, ?, 'payment_link', ?, 0, ?, ?, ?, 'completed', ?, NULL, ?)`,
      ).run(
        newId('txn'),
        row.user_id,
        amountCents,
        data.payerName,
        data.payerEmail,
        row.title,
        reference,
        paidAt,
      );
    });

    res.status(201).json({
      reference,
      amountCents,
      paidAt,
      title: row.title,
      payeeName: row.owner_name,
      payeeCompany: row.owner_company,
    });
  }),
);
