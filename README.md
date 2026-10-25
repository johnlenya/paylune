# Paylune

> **Demo only — not a real financial service.** Paylune simulates balances and payments in a local database. It cannot hold, send, receive, or withdraw real money, and it must not be used with real funds or sensitive financial data.

Paylune is a full-stack **simulated** payments platform: a marketing site, a funded wallet workspace, and a public checkout flow for payment links. It is inspired by products such as PayPal and Payoneer, but no real money, cards, bank accounts, or external payment providers are involved.

Use it to explore or demo a polished payments experience locally. Do not use it to handle real funds.

## Demo access

- **URL:** http://localhost:5173
- **Email:** `demo@paylune.app`
- **Password:** `demo1234`

The demo workspace is preloaded with a balance, six months of transactions, three virtual cards, and four payment links (one paused). New sign-ups start with **$1,000** in simulated funds.

## What's included

- **Marketing site** — hero, product tour, features, testimonials, pricing, FAQ, legal pages.
- **Accounts** — sign-up, sign-in, one-click demo login, seven-day JWT sessions.
- **Dashboard** — available balance with hide toggle, cashflow chart, quick stats, recent activity and cards.
- **Send money** — member lookup, fee-free member transfers, external transfers with a 1% fee (minimum $0.25), review step, and printable-style receipts.
- **Transactions** — search, in/out/top-up/payment-link filters, monthly grouping, detail receipts, and CSV export.
- **Virtual cards** — up to five simulated cards, brand/colour selection, freeze and unfreeze.
- **Payment links** — fixed or customer-chosen amounts, public checkout, pause/activate, copy/share, payment and collection counters.
- **Public checkout** — no Paylune account required, payer details and a decorative test card only, success receipt with reference.
- **Settings** — editable profile, account summary, session info, sign-out.
- **Responsive UI** — desktop sidebar workspace, mobile drawer navigation, mobile-safe forms, accessible modals and toasts.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite 6, React Router 7, Tailwind CSS 4, lucide-react |
| Backend | Node.js, Express 4, zod, jsonwebtoken |
| Database | SQLite through Node's built-in `node:sqlite`, WAL mode, integer cents |
| Auth | scrypt password hashes, JWT HS256 bearer tokens (7 days) |

No payment SDKs, external APIs, or network calls are used to move money.

## Requirements

- **Node.js 23.4+** (the app uses the built-in `node:sqlite` module; tested on Node 23.8).
- npm 10+.

## Run locally

```bash
npm run setup   # installs root, server and client dependencies
npm run dev     # starts API (:4000) and Vite (:5173) together
```

Open http://localhost:5173.

The API is available at http://localhost:4000 with a health check at `/api/health`. On first boot the SQLite database is created at `server/data/paylune.db` and seeded automatically.

### Production-style local run

```bash
npm run build   # builds the React app into client/dist
npm start       # Express serves the API and the built client on :4000
```

Open http://localhost:4000.

## Configuration

Copy `server/.env.example` to `server/.env` if you want to override defaults:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | API port |
| `JWT_SECRET` | local demo fallback | Signing key for session tokens |

The client uses same-origin `/api` requests; Vite proxies `/api` to `http://localhost:4000` in development. Set `VITE_API_URL` only if you host the API on another origin.

## Resetting the demo

To return to the original seeded workspace, stop the API, remove the local database files, and start it again:

```bash
rm server/data/paylune.db server/data/paylune.db-shm server/data/paylune.db-wal
npm run dev
```

The seed runs only when the database has no users.

## API overview

All authenticated routes expect `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account with a $1,000 simulated balance |
| `POST` | `/api/auth/login` | Email/password login |
| `POST` | `/api/auth/demo` | Log in to the seeded demo account |
| `GET` / `PATCH` | `/api/me` | Read or update the current profile |
| `GET` | `/api/dashboard` | Balance, stats, cashflow, recent activity, cards, links |
| `GET` | `/api/contacts` | Recent transfer recipients |
| `GET` | `/api/users/lookup?email=` | Check whether an email belongs to a Paylune member |
| `GET` | `/api/transactions` | Search/filter ledger entries (`type`, `search`, `limit`, `offset`) |
| `POST` | `/api/transfers` | Send money to a member or external email |
| `POST` | `/api/wallet/topup` | Add simulated funds |
| `GET` / `POST` | `/api/cards` | List or create virtual cards |
| `PATCH` | `/api/cards/:id` | Freeze or unfreeze a card |
| `GET` / `POST` | `/api/links` | List or create payment links |
| `PATCH` | `/api/links/:id` | Pause or reactivate a link |
| `GET` | `/api/pay/:slug` | Public payment-link details |
| `POST` | `/api/pay/:slug` | Pay a link without an account |

## Project layout

```
paylune/
├── client/                 React app
│   ├── src/
│   │   ├── components/     App shell, charts, cards, modals, UI primitives
│   │   ├── context/        Auth and toast providers
│   │   ├── lib/            API client, formatting, clipboard, title hook
│   │   └── pages/          Landing, auth, dashboard, money features, public pay
│   └── vite.config.js
├── server/                 Express API
│   ├── src/
│   │   ├── routes/         auth, account, payments, cards, links
│   │   ├── auth.js         JWT signing and middleware
│   │   ├── db.js           Schema and SQLite connection
│   │   ├── seed.js         Demo workspace seed
│   │   └── index.js        HTTP server and static client serving
│   ├── data/               Generated SQLite database (git-ignored)
│   └── .env.example
└── package.json            Setup, dev, build and start scripts
```

## Demo and security notes

This project is a product demo, **not a financial service**.

- Balances, transactions, cards, and links are local rows in SQLite. Nothing is redeemable, transferable, or connected to real money.
- No card numbers, CVVs, bank credentials, or external account details are collected. The checkout's “test card” is decorative.
- Passwords are scrypt-hashed and sessions use signed JWTs, but there is no rate limiting, email verification, MFA, or account recovery; the JWT secret falls back to a demo value when unset.
- Do not deploy this as-is to handle real users or payments. Use a production payment provider, managed secrets, HTTPS, rate limiting, and a hardened database layer for any real-world use.
