import crypto from 'node:crypto';
import { db } from './db.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export function parseBody(schema, request) {
  const result = schema.safeParse(request.body ?? {});
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue.path.length ? `${issue.path.join('.')}: ` : '';
    throw new HttpError(400, `${path}${issue.message}`);
  }
  return result.data;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, stored) {
  const [salt, expectedHex] = String(stored).split(':');
  if (!salt || !expectedHex) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

export function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

export function newReference() {
  return `PL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

export function withTransaction(fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // The transaction may already be closed.
    }
    throw error;
  }
}

export function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    country: row.country,
    balanceCents: row.balance_cents,
    createdAt: row.created_at,
  };
}

export function publicTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    amountCents: row.amount_cents,
    feeCents: row.fee_cents,
    counterpartyName: row.counterparty_name,
    counterpartyEmail: row.counterparty_email,
    description: row.description,
    status: row.status,
    reference: row.reference,
    createdAt: row.created_at,
  };
}

export function publicCard(row) {
  return {
    id: row.id,
    label: row.label,
    brand: row.brand,
    last4: row.last4,
    expMonth: row.exp_month,
    expYear: row.exp_year,
    frozen: Boolean(row.frozen),
    spendCents: row.spend_cents,
    color: row.color,
    createdAt: row.created_at,
  };
}

export function publicLink(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    amountCents: row.amount_cents,
    active: Boolean(row.active),
    paidCount: row.paid_count,
    totalCollectedCents: row.total_collected_cents,
    createdAt: row.created_at,
  };
}

export function getUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function makeSlug(title) {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 34);
  return `${base || 'payment-link'}-${crypto.randomBytes(3).toString('hex')}`;
}
