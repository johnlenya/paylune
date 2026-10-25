import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'paylune.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    company TEXT,
    country TEXT,
    balance_cents INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    fee_cents INTEGER NOT NULL DEFAULT 0,
    counterparty_name TEXT,
    counterparty_email TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    reference TEXT NOT NULL UNIQUE,
    group_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user_created
    ON transactions(user_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    brand TEXT NOT NULL,
    last4 TEXT NOT NULL,
    exp_month INTEGER NOT NULL,
    exp_year INTEGER NOT NULL,
    frozen INTEGER NOT NULL DEFAULT 0,
    spend_cents INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL DEFAULT 'obsidian',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS payment_links (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    amount_cents INTEGER,
    active INTEGER NOT NULL DEFAULT 1,
    paid_count INTEGER NOT NULL DEFAULT 0,
    total_collected_cents INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);
