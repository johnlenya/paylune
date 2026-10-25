import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import {
  HttpError,
  newId,
  parseBody,
  publicCard,
  wrap,
} from '../helpers.js';

export const cardsRouter = Router();

cardsRouter.use(requireAuth);

cardsRouter.get(
  '/',
  wrap(async (req, res) => {
    const cards = db
      .prepare('SELECT * FROM cards WHERE user_id = ? ORDER BY created_at ASC')
      .all(req.userId)
      .map(publicCard);
    res.json({ cards });
  }),
);

const createCardSchema = z.object({
  label: z.string().trim().min(1, 'Give your card a name.').max(30),
  brand: z.enum(['visa', 'mastercard']),
  color: z.enum(['obsidian', 'lime', 'violet', 'coral']).default('obsidian'),
});

cardsRouter.post(
  '/',
  wrap(async (req, res) => {
    const data = parseBody(createCardSchema, req);
    const count = db
      .prepare('SELECT COUNT(*) AS count FROM cards WHERE user_id = ?')
      .get(req.userId);
    if (Number(count.count) >= 5) {
      throw new HttpError(409, 'This demo supports up to five virtual cards per account.');
    }

    const id = newId('card');
    const now = new Date();
    const last4 = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const expMonth = Math.floor(Math.random() * 12) + 1;
    const expYear = now.getFullYear() + 3 + Math.floor(Math.random() * 2);

    db.prepare(
      `INSERT INTO cards
         (id, user_id, label, brand, last4, exp_month, exp_year, frozen, spend_cents, color, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
    ).run(
      id,
      req.userId,
      data.label,
      data.brand,
      last4,
      expMonth,
      expYear,
      data.color,
      now.toISOString(),
    );

    const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(id);
    res.status(201).json({ card: publicCard(card) });
  }),
);

const updateCardSchema = z.object({
  frozen: z.boolean({ invalid_type_error: 'Invalid card state.' }),
});

cardsRouter.patch(
  '/:id',
  wrap(async (req, res) => {
    const data = parseBody(updateCardSchema, req);
    const card = db
      .prepare('SELECT * FROM cards WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.userId);
    if (!card) throw new HttpError(404, 'Card not found.');

    db.prepare('UPDATE cards SET frozen = ? WHERE id = ?').run(
      data.frozen ? 1 : 0,
      card.id,
    );
    const updated = db.prepare('SELECT * FROM cards WHERE id = ?').get(card.id);
    res.json({ card: publicCard(updated) });
  }),
);
