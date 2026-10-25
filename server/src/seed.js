import { db } from './db.js';
import { hashPassword, newId, newReference, withTransaction } from './helpers.js';

const DAY = 86_400_000;

function daysAgo(days) {
  return new Date(Date.now() - days * DAY).toISOString();
}

export function seedDatabase() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (existing.count > 0) return;

  const now = new Date().toISOString();
  const demoHash = hashPassword('demo1234');
  const fillerHash = hashPassword('unused-demo-password-placeholder');

  const users = [
    {
      id: 'usr_demo_alex',
      name: 'Alex Mwangi',
      email: 'demo@paylune.app',
      password: demoHash,
      company: 'Northwind Studio',
      country: 'Nairobi, Kenya',
      created: daysAgo(180),
    },
    {
      id: 'usr_aisha',
      name: 'Aisha Bello',
      email: 'aisha@bellostudio.co',
      password: fillerHash,
      company: 'Bello Studio',
      country: 'Lagos, Nigeria',
      created: daysAgo(150),
    },
    {
      id: 'usr_daniel',
      name: 'Daniel Kim',
      email: 'daniel@kite.co',
      password: fillerHash,
      company: 'Kite Motion',
      country: 'Seoul, South Korea',
      created: daysAgo(140),
    },
    {
      id: 'usr_maya',
      name: 'Maya Chen',
      email: 'maya@fold.design',
      password: fillerHash,
      company: 'Fold Design',
      country: 'Singapore',
      created: daysAgo(120),
    },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, company, country, balance_cents, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `);

  const transactions = [
    [0.3, 'receive', 620000, 'Lumen Labs', 'hello@lumenlabs.io', 'Website redesign — final milestone'],
    [1.2, 'send', -120000, 'Aisha Bello', 'aisha@bellostudio.co', 'Contractor payout — October'],
    [1.9, 'payment_link', 145000, 'Kite Studio', 'studio@kite.co', 'Brand sprint — design deposit'],
    [2.6, 'card', -4500, 'Figma', 'billing@figma.com', 'Figma — Professional plan'],
    [3.4, 'send', -31240, 'Amazon Web Services', 'billing@aws.amazon.com', 'Cloud hosting — monthly'],
    [4.5, 'receive', 275000, 'Fold Studio', 'maya@fold.design', 'Product design retainer'],
    [5.8, 'card', -1600, 'Notion', 'billing@notion.so', 'Notion — Plus plan'],
    [6.9, 'payment_link', 280000, 'Sam Rivera', 'sam@north.co', 'Design retainer — October'],
    [7.6, 'withdrawal', -200000, 'KCB Bank', null, 'Withdrawal to bank •• 4821'],
    [8.8, 'send', -85000, 'Daniel Kim', 'daniel@kite.co', 'Motion design — brand reel'],
    [9.4, 'topup', 500000, 'KCB Bank', null, 'Top-up from bank •• 4821'],
    [10.6, 'card', -5499, 'Adobe', 'billing@adobe.com', 'Adobe Creative Cloud'],
    [11.5, 'payment_link', 24000, 'Jordan Lee', 'jordan@lumen.io', 'Consulting call — 60 min'],
    [13.3, 'send', -48000, 'Maya Chen', 'maya@fold.design', 'Illustration work — icons'],
    [14.2, 'receive', 380000, 'Northstar', 'hello@northstar.studio', 'Landing page build'],
    [16.2, 'card', -2500, 'Framer', 'billing@framer.com', 'Framer — Mini plan'],
    [17.1, 'payment_link', 12000, 'Sam Rivera', 'sam@north.co', 'Consulting call — 60 min'],
    [19.4, 'send', -32000, 'Jomo Kariuki', 'jomo@audio.ke', 'Audio mixing — launch film'],
    [20.5, 'receive', 110000, 'Kite Studio', 'studio@kite.co', 'Logo refresh'],
    [22.3, 'card', -1440, 'Google Workspace', 'billing@google.com', 'Google Workspace — Business'],
    [23.4, 'topup', 200000, 'M-Pesa', null, 'Top-up from M-Pesa wallet'],
    [25.6, 'withdrawal', -70000, 'M-Pesa', null, 'Withdrawal to M-Pesa wallet'],
    [28.6, 'send', -120000, 'Aisha Bello', 'aisha@bellostudio.co', 'Contractor payout — September'],
    [30.2, 'card', -1099, 'Spotify', 'billing@spotify.com', 'Spotify — Premium'],
    [33.0, 'receive', 200000, 'Northwind Bank', null, 'Opening balance'],
    [38.0, 'send', -6000, 'Vercel', 'billing@vercel.com', 'Hosting — Pro plan'],
  ];

  const insertTransaction = db.prepare(`
    INSERT INTO transactions
      (id, user_id, type, amount_cents, fee_cents, counterparty_name, counterparty_email,
       description, status, reference, group_id, created_at)
    VALUES (?, ?, ?, ?, 0, ?, ?, ?, 'completed', ?, NULL, ?)
  `);

  const insertCard = db.prepare(`
    INSERT INTO cards
      (id, user_id, label, brand, last4, exp_month, exp_year, frozen, spend_cents, color, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertLink = db.prepare(`
    INSERT INTO payment_links
      (id, user_id, slug, title, description, amount_cents, active, paid_count,
       total_collected_cents, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  withTransaction(() => {
    for (const user of users) {
      insertUser.run(
        user.id,
        user.name,
        user.email,
        user.password,
        user.company,
        user.country,
        user.created,
      );
    }

    for (const [days, type, amount, name, email, description] of transactions) {
      insertTransaction.run(
        newId('txn'),
        'usr_demo_alex',
        type,
        amount,
        name,
        email,
        description,
        newReference(),
        daysAgo(days),
      );
    }

    const cards = [
      ['card_business', 'Business', 'visa', '4821', 9, 2029, 0, 14138, 'obsidian', daysAgo(90)],
      ['card_subs', 'Subscriptions', 'mastercard', '7304', 3, 2028, 0, 2500, 'lime', daysAgo(60)],
      ['card_travel', 'Travel', 'visa', '1192', 12, 2027, 1, 0, 'violet', daysAgo(30)],
    ];
    for (const card of cards) {
      insertCard.run(card[0], 'usr_demo_alex', ...card.slice(1));
    }

    const links = [
      [
        'brand-sprint-deposit-7k2f',
        'Brand sprint — design deposit',
        '50% deposit to kick off your brand sprint. Includes discovery, moodboards, and two design directions.',
        145000,
        1,
        1,
        145000,
        daysAgo(26),
      ],
      [
        'consulting-call-alex-4m8c',
        'Consulting call with Alex',
        'Book a focused 60-minute product design consultation. You choose the amount.',
        null,
        1,
        2,
        36000,
        daysAgo(44),
      ],
      [
        'design-retainer-october-9x1p',
        'Design retainer — October',
        'Monthly product design support for October. Includes 40 hours of design and async updates.',
        280000,
        1,
        1,
        280000,
        daysAgo(32),
      ],
      [
        'portfolio-review-2b6d',
        'Portfolio review',
        'A 45-minute review of your design portfolio with actionable, honest feedback.',
        12000,
        0,
        0,
        0,
        daysAgo(18),
      ],
    ];
    for (const link of links) {
      insertLink.run(newId('link'), 'usr_demo_alex', ...link);
    }

    db.prepare(
      `UPDATE users SET balance_cents = (
        SELECT COALESCE(SUM(amount_cents), 0) FROM transactions WHERE user_id = ?
      ) WHERE id = ?`,
    ).run('usr_demo_alex', 'usr_demo_alex');
  });

  console.log('Seeded Paylune demo data — demo@paylune.app / demo1234');
}
