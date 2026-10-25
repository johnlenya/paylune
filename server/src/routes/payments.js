import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import {
  HttpError,
  getUserById,
  newId,
  newReference,
  parseBody,
  publicTransaction,
  publicUser,
  withTransaction,
  wrap,
} from '../helpers.js';

export const paymentsRouter = Router();

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Please enter a valid email address.')
  .max(120);

function nameFromEmail(email) {
  return email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

const transferSchema = z.object({
  toEmail: emailSchema,
  toName: z.string().trim().max(60).optional().default(''),
  amountCents: z
    .number({ invalid_type_error: 'Please enter an amount.' })
    .int()
    .min(100, 'The minimum transfer amount is $1.00.')
    .max(5000000, 'Transfers are limited to $50,000.00 in this demo.'),
  note: z.string().trim().max(160, 'Keep your note under 160 characters.').optional().default(''),
});

paymentsRouter.post(
  '/transfers',
  requireAuth,
  wrap(async (req, res) => {
    const data = parseBody(transferSchema, req);
    const sender = getUserById(req.userId);
    if (!sender) throw new HttpError(401, 'Your account could not be found.');

    const toEmail = data.toEmail;
    if (toEmail === sender.email.toLowerCase()) {
      throw new HttpError(400, 'You can’t send money to yourself.');
    }

    const member = db.prepare('SELECT * FROM users WHERE email = ?').get(toEmail);
    const feeCents = member ? 0 : Math.max(25, Math.round(data.amountCents * 0.01));
    const totalCents = data.amountCents + feeCents;
    const recipientName = member?.name || data.toName || nameFromEmail(toEmail);
    const now = new Date().toISOString();
    const groupId = newId('grp');
    const outgoingReference = newReference();

    withTransaction(() => {
      const debit = db
        .prepare(
          'UPDATE users SET balance_cents = balance_cents - ? WHERE id = ? AND balance_cents >= ?',
        )
        .run(totalCents, sender.id, totalCents);

      if (Number(debit.changes) === 0) {
        throw new HttpError(
          400,
          'Your balance is too low to cover this transfer and its fee. Add money and try again.',
        );
      }

      db.prepare(
        `INSERT INTO transactions
           (id, user_id, type, amount_cents, fee_cents, counterparty_name, counterparty_email,
            description, status, reference, group_id, created_at)
         VALUES (?, ?, 'send', ?, ?, ?, ?, ?, 'completed', ?, ?, ?)`,
      ).run(
        newId('txn'),
        sender.id,
        -totalCents,
        feeCents,
        recipientName,
        toEmail,
        data.note || 'Sent with Paylune',
        outgoingReference,
        groupId,
        now,
      );

      if (member) {
        db.prepare('UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?').run(
          data.amountCents,
          member.id,
        );
        db.prepare(
          `INSERT INTO transactions
             (id, user_id, type, amount_cents, fee_cents, counterparty_name, counterparty_email,
              description, status, reference, group_id, created_at)
           VALUES (?, ?, 'receive', ?, 0, ?, ?, ?, 'completed', ?, ?, ?)`,
        ).run(
          newId('txn'),
          member.id,
          data.amountCents,
          sender.name,
          sender.email,
          data.note || 'Transfer received',
          newReference(),
          groupId,
          now,
        );
      }
    });

    const updatedSender = getUserById(sender.id);
    const transaction = db
      .prepare('SELECT * FROM transactions WHERE reference = ?')
      .get(outgoingReference);

    res.status(201).json({
      transaction: publicTransaction(transaction),
      feeCents,
      totalCents,
      amountCents: data.amountCents,
      balanceCents: updatedSender.balance_cents,
      recipient: {
        name: recipientName,
        email: toEmail,
        member: Boolean(member),
      },
    });
  }),
);

const topupSchema = z.object({
  amountCents: z
    .number({ invalid_type_error: 'Please enter an amount.' })
    .int()
    .min(100, 'The minimum top-up is $1.00.')
    .max(5000000, 'Top-ups are limited to $50,000.00 in this demo.'),
  source: z.string().trim().min(2, 'Choose a funding source.').max(60),
});

paymentsRouter.post(
  '/wallet/topup',
  requireAuth,
  wrap(async (req, res) => {
    const data = parseBody(topupSchema, req);
    const user = getUserById(req.userId);
    if (!user) throw new HttpError(401, 'Your account could not be found.');

    const reference = newReference();
    const now = new Date().toISOString();

    withTransaction(() => {
      db.prepare('UPDATE users SET balance_cents = balance_cents + ? WHERE id = ?').run(
        data.amountCents,
        user.id,
      );
      db.prepare(
        `INSERT INTO transactions
           (id, user_id, type, amount_cents, fee_cents, counterparty_name, counterparty_email,
            description, status, reference, group_id, created_at)
         VALUES (?, ?, 'topup', ?, 0, ?, NULL, ?, 'completed', ?, NULL, ?)`,
      ).run(
        newId('txn'),
        user.id,
        data.amountCents,
        data.source,
        `Top-up from ${data.source}`,
        reference,
        now,
      );
    });

    const updatedUser = getUserById(user.id);
    const transaction = db
      .prepare('SELECT * FROM transactions WHERE reference = ?')
      .get(reference);

    res.status(201).json({
      user: publicUser(updatedUser),
      transaction: publicTransaction(transaction),
    });
  }),
);

paymentsRouter.get(
  '/users/lookup',
  requireAuth,
  wrap(async (req, res) => {
    const email = String(req.query.email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({ member: false, isSelf: false });
    }

    const member = db
      .prepare('SELECT id, name, email, company FROM users WHERE email = ?')
      .get(email);

    if (!member) return res.json({ member: false, isSelf: false });
    if (member.id === req.userId) {
      return res.json({ member: false, isSelf: true });
    }

    return res.json({
      member: true,
      isSelf: false,
      name: member.name,
      company: member.company,
      email: member.email,
    });
  }),
);

paymentsRouter.get(
  '/transactions',
  requireAuth,
  wrap(async (req, res) => {
    const type = String(req.query.type ?? 'all');
    const search = String(req.query.search ?? '').trim().slice(0, 80);
    const limit = Math.min(500, Math.max(1, Number.parseInt(req.query.limit, 10) || 100));
    const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);

    const conditions = ['user_id = ?'];
    const params = [req.userId];

    if (['in', 'out', 'topup', 'payment_link'].includes(type)) {
      if (type === 'in') conditions.push('amount_cents > 0');
      if (type === 'out') conditions.push('amount_cents < 0');
      if (type === 'topup') conditions.push("type = 'topup'");
      if (type === 'payment_link') conditions.push("type = 'payment_link'");
    }

    if (search) {
      conditions.push(
        "(LOWER(COALESCE(counterparty_name, '')) LIKE ? OR LOWER(COALESCE(description, '')) LIKE ? OR LOWER(reference) LIKE ?)",
      );
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term);
    }

    const where = conditions.join(' AND ');
    const total = db
      .prepare(`SELECT COUNT(*) AS count FROM transactions WHERE ${where}`)
      .get(...params);

    const rows = db
      .prepare(
        `SELECT * FROM transactions WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      )
      .all(...params, limit, offset);

    res.json({
      transactions: rows.map(publicTransaction),
      total: Number(total.count),
      limit,
      offset,
    });
  }),
);
