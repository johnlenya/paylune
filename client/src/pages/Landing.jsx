import { Link } from 'react-router-dom';
import {
  Aperture,
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  Circle,
  Compass,
  CreditCard,
  Layers,
  Link2,
  LockKeyhole,
  Mail,
  Plus,
  ShieldCheck,
  Sparkles,
  Triangle,
  UserPlus,
  Wallet,
  Zap,
  Send,
} from 'lucide-react';
import MarketingNav from '../components/MarketingNav';
import MarketingFooter from '../components/MarketingFooter';
import HeroVisual from '../components/landing/HeroVisual';
import CardVisual from '../components/CardVisual';
import { Avatar } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { cx } from '../lib/format';

const CURRENCIES = [
  ['$', 'USD'],
  ['€', 'EUR'],
  ['£', 'GBP'],
  ['KSh', 'KES'],
  ['₦', 'NGN'],
  ['C$', 'CAD'],
  ['A$', 'AUD'],
  ['¥', 'JPY'],
  ['R', 'ZAR'],
  ['AED', 'AED'],
];

const BRANDS = [
  { name: 'LUMEN', icon: Aperture, className: 'tracking-[0.18em]' },
  { name: 'northstar', icon: Compass, className: 'font-medium' },
  { name: 'FOLD', icon: Layers, className: 'tracking-[0.08em]' },
  { name: 'kite', icon: Triangle, className: 'font-medium' },
  { name: 'Orbit', icon: Circle, className: 'font-medium' },
  { name: 'mono', icon: Box, className: 'tracking-[0.1em]' },
];

const STEPS = [
  {
    icon: UserPlus,
    title: 'Open your account',
    description:
      'Sign up with your email. No forms, no branch visits, no waiting on a letter in the post.',
    detail: 'About 2 minutes',
  },
  {
    icon: Wallet,
    title: 'Add money, or get paid',
    description:
      'Top up instantly in the demo, or share a payment link with a client and let the money come to you.',
    detail: 'Instant top-ups · Unlimited links',
  },
  {
    icon: Send,
    title: 'Move it wherever it’s needed',
    description:
      'Send to other Paylune accounts, pay your team, or move money to your bank and mobile wallet.',
    detail: 'Transparent 1% external fee',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'I used to chase three banks and a spreadsheet. Now client payments land in one account and I can see exactly what’s left.',
    name: 'Aisha Bello',
    role: 'Founder, Bello Studio',
    location: 'Lagos',
  },
  {
    quote:
      'We pay designers in four countries every Friday. It takes minutes now, not an entire afternoon of transfers.',
    name: 'Daniel Kim',
    role: 'Creative Director, Kite Motion',
    location: 'Seoul',
  },
  {
    quote:
      'The payment links alone paid for themselves. I send one before the kickoff call and the deposit is already there.',
    name: 'Maya Chen',
    role: 'Founder, Fold Design',
    location: 'Singapore',
  },
];

const PRICING = [
  {
    name: 'Personal',
    price: '$0',
    period: 'forever',
    tagline: 'Everything you need to get paid.',
    features: [
      'Free transfers between Paylune accounts',
      '1% on external transfers (min $0.25)',
      'Unlimited payment links',
      'Up to 5 virtual cards',
      'Instant demo top-ups',
    ],
    cta: 'Open free account',
    to: '/signup',
  },
  {
    name: 'Business',
    price: '$19',
    period: 'per month',
    tagline: 'For studios and teams that move fast.',
    features: [
      'Everything in Personal',
      '0.5% external transfer fee',
      'Unlimited virtual cards',
      'Team access and roles',
      'Priority payout support',
    ],
    cta: 'Start with Business',
    to: '/signup',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    tagline: 'For payments at serious volume.',
    features: [
      'Volume-based transfer fees',
      'API and webhooks',
      'Custom approval workflows',
      'Dedicated account manager',
      'Compliance documentation',
    ],
    cta: 'Talk to us',
    href: 'mailto:hello@paylune.app',
  },
];

const FAQS = [
  {
    question: 'Is Paylune a real bank or payment provider?',
    answer:
      'No. Paylune is a full-stack product demo. It is not a bank, money transmitter, or licensed payment provider. No real funds are held, transferred, or insured — every balance and payment in the app is simulated.',
  },
  {
    question: 'How do transfers work in the demo?',
    answer:
      'Your demo wallet lives in a local SQLite database. Sending money updates both the sender and recipient balances instantly, records a ledger entry, and returns a demo receipt. Sending to an email that belongs to another Paylune account is free; external demo payouts use a simulated 1% fee.',
  },
  {
    question: 'Do you charge real fees?',
    answer:
      'No. Nothing in this demo touches real money, cards, or bank accounts. The fee previews, balances, and receipts are illustrative so you can experience a complete payments flow without spending anything.',
  },
  {
    question: 'Can I connect my real bank account or card?',
    answer:
      'No. The funding sources in the app are fictional. Add money using the simulated sources provided, and use the test checkout in payment links. Never enter real card or banking details into a demo.',
  },
  {
    question: 'What happens to the data I enter?',
    answer:
      'Accounts and demo activity are stored locally in your own Paylune database. Passwords are salted and hashed, and sessions use signed tokens. This is a development demo, so don’t reuse a real password. You can reset everything by deleting the local database file.',
  },
  {
    question: 'Can I adapt this for my own product?',
    answer:
      'Yes, the codebase is a practical starting point for learning or prototyping. Shipping a real payments product requires proper licensing, KYC/AML programs, a regulated banking partner, security reviews, and compliance work. The demo is not production-ready financial software.',
  },
];

function SectionIntro({ eyebrow, title, copy, align = 'left', dark = true }) {
  return (
    <div
      className={cx(
        'max-w-[660px]',
        align === 'center' && 'mx-auto text-center',
        !dark && 'text-ink',
      )}
    >
      <p className={cx('eyebrow', dark ? 'text-lime/70' : 'text-ink/40')}>
        <span className={cx('h-1.5 w-1.5 rounded-full', dark ? 'bg-lime' : 'bg-ink/40')} />
        {eyebrow}
      </p>
      <h2
        className={cx(
          'mt-5 text-balance font-display text-[36px] font-semibold leading-[1.03] tracking-[-0.05em] sm:text-[46px] lg:text-[50px]',
          dark ? 'text-cream' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {copy ? (
        <p
          className={cx(
            'mt-4 max-w-[540px] text-pretty text-[14px] leading-6',
            align === 'center' && 'mx-auto',
            dark ? 'text-cream/45' : 'text-slate-ink',
          )}
        >
          {copy}
        </p>
      ) : null}
    </div>
  );
}

function CurrencyTicker() {
  return (
    <div className="relative mt-16 border-y border-white/[0.06] py-4 sm:mt-24">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent"
        aria-hidden="true"
      />
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center gap-9 pr-9"
            aria-hidden={copy === 1 ? 'true' : undefined}
          >
            <span className="eyebrow whitespace-nowrap text-cream/25">
              One account · 40+ currencies
            </span>
            {CURRENCIES.map(([symbol, code]) => (
              <span
                key={`${copy}-${code}`}
                className="flex items-baseline gap-1.5 whitespace-nowrap text-[11.5px] text-cream/35"
              >
                <span className="font-mono text-[12px] text-lime/55">{symbol}</span>
                {code}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden pb-16 pt-[124px] sm:pt-[140px] lg:pb-20 lg:pt-[166px]">
      <div className="grid-fade pointer-events-none absolute inset-x-0 top-0 h-[780px] opacity-70" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-40 top-48 h-[420px] w-[420px] rounded-full bg-lime/[0.045] blur-3xl"
        aria-hidden="true"
      />
      <div className="marketing-x relative">
        <div className="grid items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8">
          <div className="animate-fade-up max-w-[620px]">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-lime/20 bg-lime/[0.06] px-3.5 py-1.5 text-[11px] font-medium text-lime/80 transition hover:border-lime/35 hover:bg-lime/[0.09]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              Live product demo — no real money moves
              <ArrowUpRight className="h-3 w-3" />
            </Link>

            <h1 className="mt-6 text-balance font-display text-[52px] font-semibold leading-[0.97] tracking-[-0.055em] text-cream sm:text-[68px] lg:text-[74px]">
              Money moves.
              <br />
              <span className="text-lime">You don’t wait.</span>
            </h1>

            <p className="mt-6 max-w-[500px] text-pretty text-[15px] leading-7 text-cream/50 sm:text-[16px]">
              One borderless account for client payments, team payouts, and cards. Get paid by
              anyone, anywhere — and keep every cent moving.
            </p>

            <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
              <Link to="/signup" className="btn btn-primary btn-lg group">
                Create free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Explore the demo
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-cream/35">
              {['Free to join', 'No monthly fees', '2-minute setup'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-lime/70" />
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                <Avatar name="Aisha Bello" size="sm" className="ring-2 ring-ink" />
                <Avatar name="Daniel Kim" size="sm" className="ring-2 ring-ink" />
                <Avatar name="Maya Chen" size="sm" className="ring-2 ring-ink" />
                <Avatar name="Alex Mwangi" size="sm" className="ring-2 ring-ink" />
              </div>
              <div>
                <p className="text-[11.5px] font-medium text-cream/65">
                  Built for people who work everywhere
                </p>
                <p className="mt-0.5 text-[10px] text-cream/30">
                  Freelancers · Studios · Remote teams
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-4 lg:mt-0">
            <HeroVisual />
          </div>
        </div>

        <CurrencyTicker />
      </div>
    </section>
  );
}

function LogoStrip() {
  return (
    <section className="border-b border-white/[0.06] py-9" aria-label="Trusted by modern teams">
      <div className="marketing-x flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="eyebrow whitespace-nowrap text-cream/25">Built for modern teams</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-10 lg:gap-x-9">
          {BRANDS.map((brand) => {
            const Icon = brand.icon;
            return (
              <div
                key={brand.name}
                className="flex items-center gap-2 text-cream/30 transition-colors hover:text-cream/60"
              >
                <Icon className="h-4 w-4" strokeWidth={1.6} />
                <span className={cx('font-display text-[14px] font-medium', brand.className)}>
                  {brand.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PaymentMock() {
  return (
    <div className="relative mx-auto mt-5 w-full max-w-[286px] rounded-2xl border border-white/[0.08] bg-pine p-4">
      <div className="flex items-center gap-2.5">
        <Avatar name="Aisha Bello" size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-cream/90">Aisha Bello</p>
          <p className="truncate text-[9px] text-cream/30">aisha@bellostudio.co</p>
        </div>
        <span className="rounded-full bg-lime/15 px-2 py-0.5 text-[8px] font-semibold text-lime">
          Member
        </span>
      </div>
      <p className="numeric mt-4 font-display text-[28px] font-semibold tracking-[-0.04em] text-cream">
        $1,200.00
      </p>
      <div className="mt-3 flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-[9.5px]">
        <span className="text-cream/35">Delivery</span>
        <span className="inline-flex items-center gap-1 text-lime/80">
          <Zap className="h-2.5 w-2.5" /> Instant · Free
        </span>
      </div>
      <div className="mt-2.5 rounded-lg bg-lime py-2 text-center text-[10px] font-semibold text-ink">
        Send money
      </div>
    </div>
  );
}

function LinkMock() {
  return (
    <div className="relative mx-auto mt-5 w-full max-w-[278px] rounded-2xl bg-lime p-4 text-ink shadow-[0_20px_40px_-24px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-semibold uppercase tracking-[0.16em] text-ink/40">
          Paylune checkout
        </span>
        <LockKeyhole className="h-3 w-3 text-ink/40" />
      </div>
      <p className="mt-3 text-[9.5px] text-ink/50">Northwind Studio</p>
      <p className="mt-0.5 text-[12px] font-semibold">Brand sprint — deposit</p>
      <p className="numeric mt-3 font-display text-[25px] font-semibold tracking-[-0.04em]">
        $1,450.00
      </p>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-ink/[0.08] px-2.5 py-2 text-[9px] text-ink/55">
        <CreditCard className="h-3 w-3" />
        Test card ···· 4242
        <span className="ml-auto font-semibold text-ink/70">Demo</span>
      </div>
      <div className="mt-2 rounded-lg bg-ink py-2 text-center text-[10px] font-semibold text-cream">
        Pay now
      </div>
    </div>
  );
}

function ProductSection() {
  const demoCard = {
    label: 'Northwind Studio',
    brand: 'visa',
    last4: '4821',
    expMonth: 9,
    expYear: 2029,
    color: 'obsidian',
    frozen: false,
  };

  const products = [
    {
      key: 'payments',
      label: 'Payments',
      icon: Send,
      title: 'Money that arrives, not pends.',
      copy:
        'Send to any Paylune account instantly, or pay out to a bank or wallet with the fee shown up front. No mystery deductions.',
      visual: <PaymentMock />,
    },
    {
      key: 'cards',
      label: 'Virtual cards',
      icon: CreditCard,
      title: 'A card for every corner of the internet.',
      copy:
        'Create cards for software, ads, and travel. Freeze one mid-subscription and unfreeze it just as fast.',
      visual: (
        <div className="mx-auto mt-3 w-full max-w-[290px]">
          <CardVisual card={demoCard} />
        </div>
      ),
    },
    {
      key: 'links',
      label: 'Payment links',
      icon: Link2,
      title: 'A link that does the invoicing.',
      copy:
        'Create a payment link, share it anywhere, and let clients pay without a follow-up email in sight.',
      visual: <LinkMock />,
    },
  ];

  return (
    <section id="product" className="relative scroll-mt-24 py-20 sm:py-28">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-lime/[0.035] blur-3xl"
        aria-hidden="true"
      />
      <div className="marketing-x relative">
        <SectionIntro
          eyebrow="One account, everything in it"
          title="Three ways to keep money moving."
          copy="Stop stitching together banks, spreadsheets, and links. Paylune gives your money one place to live — and a dozen ways to move."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <article
                key={product.key}
                className="group relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-pine p-5 transition-colors duration-300 hover:border-white/[0.13] sm:p-6"
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(201,246,93,0.06),transparent_65%)]"
                  aria-hidden="true"
                />
                <div className="relative flex h-[240px] items-center justify-center overflow-hidden rounded-2xl border border-white/[0.05] bg-[#0A130D] px-4">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-60"
                    style={{
                      backgroundImage:
                        'radial-gradient(rgba(255,255,255,0.05) 0.7px, transparent 0.7px)',
                      backgroundSize: '16px 16px',
                      maskImage: 'linear-gradient(to bottom, black, transparent 80%)',
                    }}
                    aria-hidden="true"
                  />
                  <div className="relative w-full transition-transform duration-500 group-hover:-translate-y-1">
                    {product.visual}
                  </div>
                </div>

                <div className="relative mt-6">
                  <div className="flex items-center gap-2 text-lime/75">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="text-[9.5px] font-semibold uppercase tracking-[0.16em]">
                      {product.label}
                    </span>
                  </div>
                  <h3 className="mt-2.5 text-[21px] font-semibold leading-[1.15] text-cream">
                    {product.title}
                  </h3>
                  <p className="mt-2.5 text-[12.5px] leading-6 text-cream/40">{product.copy}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 overflow-hidden bg-cream py-20 text-ink sm:py-28"
    >
      <div className="dot-fade pointer-events-none absolute right-0 top-0 h-80 w-80 opacity-40" aria-hidden="true" />
      <div className="marketing-x relative">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionIntro
              eyebrow="How it works"
              title="Up and running before your coffee goes cold."
              copy="No paperwork. No waiting room. Open a demo account and move money before the kettle boils."
              dark={false}
            />
            <Link to="/login" className="btn btn-dark mt-7">
              Try the 2-minute demo
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-ink/10 pt-6">
              {[
                ['2 min', 'to get started'],
                ['1%', 'external fee'],
                ['$0', 'monthly cost'],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-[28px] font-semibold tracking-[-0.04em]">
                    {value}
                  </p>
                  <p className="mt-1 text-[10.5px] leading-4 text-ink/40">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute bottom-12 left-[29px] top-12 hidden w-px bg-gradient-to-b from-ink/15 via-ink/10 to-transparent sm:block"
              aria-hidden="true"
            />
            <div className="space-y-3">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="relative rounded-[22px] border border-ink/[0.06] bg-white p-6 shadow-soft sm:pl-[88px]"
                  >
                    <div className="absolute left-6 top-6 hidden h-11 w-11 place-items-center rounded-full border border-ink/10 bg-cream font-display text-[13px] font-semibold text-ink/60 sm:grid">
                      0{index + 1}
                    </div>
                    <div className="flex items-center gap-3 sm:block">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime/55 text-ink sm:hidden">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-[18px] font-semibold tracking-[-0.025em]">
                            {step.title}
                          </h3>
                          <Icon className="hidden h-4 w-4 text-ink/25 sm:block" />
                        </div>
                        <p className="mt-2 max-w-md text-[12.5px] leading-6 text-slate-ink">
                          {step.description}
                        </p>
                        <p className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-medium text-ink/40">
                          <Check className="h-3 w-3 text-ink/50" />
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function GlobeVisual() {
  return (
    <div className="relative mt-8 h-[190px] overflow-hidden rounded-2xl border border-white/[0.05] bg-[#0A130D]">
      <div className="absolute -bottom-24 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full border border-white/10" />
      <div className="absolute -bottom-16 left-1/2 h-[220px] w-[220px] -translate-x-1/2 rounded-full border border-white/10" />
      <div className="absolute -bottom-8 left-1/2 h-[140px] w-[140px] -translate-x-1/2 rounded-full border border-lime/20" />
      <div className="absolute bottom-[54px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-lime shadow-[0_0_20px_rgba(201,246,93,0.8)]" />
      <div className="absolute left-[12%] top-[28%] rounded-full border border-white/10 bg-pine/90 px-3 py-1.5 text-[9px] text-cream/60 backdrop-blur">
        Nairobi <span className="text-lime/70">→</span> London
      </div>
      <div className="absolute right-[10%] top-[18%] rounded-full border border-white/10 bg-pine/90 px-3 py-1.5 text-[9px] text-cream/60 backdrop-blur">
        USD <span className="text-lime/70">→</span> KES
      </div>
      <div className="absolute bottom-[16%] right-[16%] rounded-full border border-lime/20 bg-lime/10 px-3 py-1.5 text-[9px] text-lime/80 backdrop-blur">
        Settled in seconds
      </div>
    </div>
  );
}

function InsightsVisual() {
  const bars = [
    { label: 'Software', value: '42%', height: 'h-[46%]' },
    { label: 'Team', value: '28%', height: 'h-[62%]' },
    { label: 'Travel', value: '18%', height: 'h-[34%]' },
    { label: 'Other', value: '12%', height: 'h-[24%]' },
  ];

  return (
    <div className="mt-7 rounded-2xl border border-white/[0.06] bg-[#0A130D] p-4">
      <div className="flex items-center justify-between text-[9.5px]">
        <span className="text-cream/35">October spending</span>
        <span className="numeric font-semibold text-cream/75">$2,314.80</span>
      </div>
      <div className="mt-4 flex h-[96px] items-end gap-2.5">
        {bars.map((bar, index) => (
          <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div
              className={cx(
                'w-full rounded-t-md',
                index === 1 ? 'bg-lime' : 'bg-white/[0.1]',
                bar.height,
              )}
            />
            <span className="text-[8px] text-cream/30">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpeedVisual() {
  return (
    <div className="mt-7 space-y-2">
      {[
        ['Aisha Bello', 'Contractor payout', '+$1,200.00', 'Paid in 1.4s'],
        ['Maya Chen', 'Illustration work', '+$480.00', 'Paid in 1.2s'],
      ].map(([name, note, amount, time]) => (
        <div
          key={name}
          className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0A130D] px-3.5 py-3"
        >
          <Avatar name={name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10.5px] font-medium text-cream/80">{name}</p>
            <p className="truncate text-[9px] text-cream/30">{note}</p>
          </div>
          <div className="text-right">
            <p className="numeric text-[10.5px] font-semibold text-cream/75">{amount}</p>
            <p className="mt-0.5 flex items-center justify-end gap-1 text-[8.5px] text-lime/60">
              <Zap className="h-2.5 w-2.5" /> {time}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-24 py-20 sm:py-28">
      <div className="marketing-x">
        <SectionIntro
          eyebrow="The details, handled"
          title="Small things. Very big difference."
          copy="The features that turn a payment app into the place your money actually lives."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <article className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-pine p-6 sm:p-8 lg:col-span-7">
            <div className="relative z-10 flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-lime/80">
                <Sparkles className="h-[18px] w-[18px]" />
              </span>
              <div className="max-w-sm">
                <h3 className="text-[22px] font-semibold leading-tight text-cream">
                  140+ countries. Zero drama.
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-6 text-cream/40">
                  Receive in USD, keep one clear balance, and pay out to bank accounts and
                  mobile wallets wherever your people are.
                </p>
              </div>
            </div>
            <GlobeVisual />
          </article>

          <article
            id="security"
            className="relative scroll-mt-24 overflow-hidden rounded-[26px] bg-lime p-6 text-ink sm:p-8 lg:col-span-5"
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border border-ink/10"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full border border-ink/10"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-lime">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-[22px] font-semibold leading-tight">
                Locked down by default.
              </h3>
              <p className="mt-2.5 text-[12.5px] leading-6 text-ink/60">
                Your account is protected with encrypted sessions, hashed passwords, and the
                kind of basics that shouldn’t be optional.
              </p>
              <div className="mt-7 flex flex-wrap gap-1.5">
                {['256-bit encryption', '2FA-ready', 'Fraud monitoring', 'Session control'].map(
                  (item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/35 px-2.5 py-1 text-[9.5px] font-medium text-ink/65"
                    >
                      <LockKeyhole className="h-2.5 w-2.5" />
                      {item}
                    </span>
                  ),
                )}
              </div>
              <p className="mt-6 text-[9px] uppercase tracking-[0.14em] text-ink/35">
                Built for the demo with real care
              </p>
            </div>
          </article>

          <article className="rounded-[26px] border border-white/[0.07] bg-pine p-6 sm:p-8 lg:col-span-5">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-lime/80">
                <Layers className="h-[18px] w-[18px]" />
              </span>
              <div>
                <h3 className="text-[22px] font-semibold leading-tight text-cream">
                  See where it all goes.
                </h3>
                <p className="mt-2.5 text-[12.5px] leading-6 text-cream/40">
                  Clear activity, tidy receipts, and spending that actually makes sense at a
                  glance.
                </p>
              </div>
            </div>
            <InsightsVisual />
          </article>

          <article className="relative overflow-hidden rounded-[26px] border border-white/[0.07] bg-pine p-6 sm:p-8 lg:col-span-7">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
              <div className="flex items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-lime/80">
                  <Zap className="h-[18px] w-[18px]" />
                </span>
                <div className="max-w-xs">
                  <h3 className="text-[22px] font-semibold leading-tight text-cream">
                    Fast isn’t a feature. It’s the point.
                  </h3>
                  <p className="mt-2.5 text-[12.5px] leading-6 text-cream/40">
                    Most transfers between Paylune accounts settle in under two seconds.
                    Because waiting for money went out with fax machines.
                  </p>
                </div>
              </div>
              <span className="shrink-0 self-start rounded-full border border-lime/20 bg-lime/[0.07] px-3 py-1.5 font-display text-[18px] font-semibold tracking-[-0.03em] text-lime/90">
                1.4s
              </span>
            </div>
            <SpeedVisual />
          </article>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="border-y border-white/[0.06] bg-[#0A130D] py-20 sm:py-24">
      <div className="marketing-x">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionIntro eyebrow="Word on the street" title="Less chasing. More creating." />
          <div className="flex items-center gap-2 pb-1">
            <span className="text-[12px] tracking-[0.1em] text-lime">★★★★★</span>
            <span className="text-[10.5px] text-cream/30">from teams in 12 time zones</span>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex flex-col rounded-[22px] border border-white/[0.07] bg-pine p-6"
            >
              <span className="font-display text-[32px] leading-none text-lime/30">“</span>
              <blockquote className="mt-2 flex-1 text-[13px] leading-6 text-cream/60">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
                <Avatar name={testimonial.name} size="sm" />
                <div>
                  <p className="text-[11.5px] font-medium text-cream/85">{testimonial.name}</p>
                  <p className="mt-0.5 text-[9.5px] text-cream/30">
                    {testimonial.role} · {testimonial.location}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 bg-cream py-20 text-ink sm:py-28">
      <div className="marketing-x">
        <SectionIntro
          eyebrow="Simple pricing"
          title="Start free. Grow when it earns its keep."
          copy="No setup fees, no hidden spreads, no surprise line items. Just one clear fee when money leaves the Paylune network."
          align="center"
          dark={false}
        />

        <div className="mt-12 grid items-start gap-4 lg:grid-cols-3">
          {PRICING.map((plan) => (
            <article
              key={plan.name}
              className={cx(
                'relative flex h-full flex-col rounded-[26px] p-6 sm:p-7',
                plan.featured
                  ? 'bg-ink text-cream shadow-lift lg:-mt-4 lg:pb-10 lg:pt-10'
                  : 'border border-ink/[0.08] bg-white text-ink',
              )}
            >
              {plan.featured ? (
                <span className="absolute right-6 top-6 rounded-full bg-lime px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-[0.12em] text-ink">
                  Most popular
                </span>
              ) : null}
              <h3
                className={cx(
                  'text-[12px] font-semibold uppercase tracking-[0.14em]',
                  plan.featured ? 'text-lime/80' : 'text-ink/40',
                )}
              >
                {plan.name}
              </h3>
              <div className="mt-4 flex items-end gap-1.5">
                <span className="font-display text-[42px] font-semibold leading-none tracking-[-0.05em]">
                  {plan.price}
                </span>
                <span
                  className={cx(
                    'pb-1 text-[11px]',
                    plan.featured ? 'text-cream/35' : 'text-ink/35',
                  )}
                >
                  {plan.period}
                </span>
              </div>
              <p
                className={cx(
                  'mt-3 text-[12px] leading-5',
                  plan.featured ? 'text-cream/45' : 'text-slate-ink',
                )}
              >
                {plan.tagline}
              </p>

              <ul
                className={cx(
                  'mt-6 flex-1 space-y-3 border-t pt-6',
                  plan.featured ? 'border-white/[0.08]' : 'border-ink/[0.07]',
                )}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span
                      className={cx(
                        'mt-[1px] grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full',
                        plan.featured ? 'bg-lime/15 text-lime' : 'bg-lime/55 text-ink',
                      )}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={2.8} />
                    </span>
                    <span
                      className={cx(
                        'text-[11.5px] leading-5',
                        plan.featured ? 'text-cream/65' : 'text-ink/65',
                      )}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {plan.href ? (
                  <a
                    href={plan.href}
                    className="btn btn-light w-full border-ink/10 bg-transparent hover:bg-ink/5"
                  >
                    {plan.cta}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <Link
                    to={plan.to}
                    className={cx('btn w-full', plan.featured ? 'btn-primary' : 'btn-dark')}
                  >
                    {plan.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-7 max-w-xl text-center text-[10.5px] leading-4 text-ink/35">
          Prices are illustrative for this demo. The live app is free, uses simulated funds, and
          applies a 1% fee to external transfers.
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="scroll-mt-24 py-20 sm:py-28">
      <div className="marketing-x grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionIntro
            eyebrow="Questions, answered"
            title="The fine print, made readable."
            copy="Everything worth knowing about what this demo is — and what it isn’t."
          />
          <a
            href="mailto:hello@paylune.app"
            className="mt-7 inline-flex items-center gap-2 text-[12px] font-medium text-cream/50 transition hover:text-cream"
          >
            <Mail className="h-3.5 w-3.5" />
            Still curious? hello@paylune.app
          </a>
        </div>

        <div className="border-t border-white/[0.08]">
          {FAQS.map((faq, index) => (
            <details
              key={faq.question}
              className="group border-b border-white/[0.08]"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[14px] font-medium text-cream/85 transition hover:text-cream [&::-webkit-details-marker]:hidden">
                {faq.question}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-cream/40 transition group-open:rotate-45 group-open:border-lime/30 group-open:text-lime">
                  <Plus className="h-3.5 w-3.5" />
                </span>
              </summary>
              <p className="max-w-[640px] pb-6 pr-10 text-[12.5px] leading-6 text-cream/40">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const { user } = useAuth();

  return (
    <section className="relative py-14 sm:py-20">
      <div className="marketing-x">
        <div className="relative overflow-hidden rounded-[30px] bg-lime px-6 py-12 text-ink sm:rounded-[36px] sm:px-10 sm:py-16 lg:px-16">
          <div
            className="pointer-events-none absolute -right-24 -top-32 h-[430px] w-[430px] rounded-full border border-ink/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-10 -top-16 h-[270px] w-[270px] rounded-full border border-ink/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.25]"
            style={{
              backgroundImage: 'radial-gradient(rgba(8,16,11,0.25) 0.8px, transparent 0.8px)',
              backgroundSize: '20px 20px',
            }}
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <p className="eyebrow text-ink/40">
                <span className="h-1.5 w-1.5 rounded-full bg-ink/40" />
                Ready when you are
              </p>
              <h2 className="mt-4 max-w-[620px] text-balance font-display text-[38px] font-semibold leading-[1.0] tracking-[-0.05em] sm:text-[52px]">
                Your money should move at your speed.
              </h2>
              <p className="mt-4 max-w-md text-[13px] leading-6 text-ink/55">
                Open a demo account, explore every corner, and see what a payment account
                built for modern work feels like.
              </p>
              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  to={user ? '/app' : '/signup'}
                  className="btn btn-dark btn-lg bg-ink hover:bg-forest"
                >
                  {user ? 'Back to your dashboard' : 'Create your account'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="btn border border-ink/15 bg-transparent text-ink hover:bg-ink/[0.06]"
                >
                  Try the demo
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-5 text-[10px] font-medium text-ink/40">
                Demo only · $1,000 in simulated funds · No real money involved
              </p>
            </div>

            <div className="relative hidden h-[280px] items-center justify-center lg:flex">
              <div className="absolute h-[280px] w-[280px] rounded-full border border-ink/10" />
              <div className="absolute h-[205px] w-[205px] rounded-full border border-ink/15" />
              <div className="grid h-[92px] w-[92px] place-items-center rounded-full bg-ink text-lime shadow-[0_24px_50px_-20px_rgba(8,16,11,0.6)]">
                <ArrowUpRight className="h-9 w-9" strokeWidth={1.6} />
              </div>
              <div className="absolute left-0 top-8 flex items-center gap-2 rounded-xl border border-ink/10 bg-cream px-3 py-2 shadow-soft">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-lime">
                  <Check className="h-3 w-3 text-ink" />
                </span>
                <div>
                  <p className="text-[9.5px] font-semibold">Payment received</p>
                  <p className="numeric text-[8.5px] text-ink/45">+$6,200.00</p>
                </div>
              </div>
              <div className="absolute bottom-7 right-0 rounded-xl bg-ink px-3.5 py-2.5 text-cream shadow-lift">
                <p className="text-[8px] uppercase tracking-[0.12em] text-cream/35">Sent to</p>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar name="Aisha Bello" size="xs" />
                  <p className="text-[9.5px] font-medium">Aisha Bello</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  useDocumentTitle();

  return (
    <div className="min-h-dvh overflow-x-clip bg-ink text-cream">
      <MarketingNav />
      <main>
        <Hero />
        <LogoStrip />
        <ProductSection />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <MarketingFooter />
    </div>
  );
}
