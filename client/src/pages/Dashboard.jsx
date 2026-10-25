import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CreditCard,
  Eye,
  EyeOff,
  Link2,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { Avatar, Badge, EmptyState } from '../components/ui';
import CashflowChart from '../components/CashflowChart';
import CardVisual from '../components/CardVisual';
import TransactionItem from '../components/TransactionItem';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { api } from '../lib/api';
import {
  cx,
  formatDate,
  greeting,
  usd,
  usdCompact,
} from '../lib/format';

function BalanceSpark({ data }) {
  const points = useMemo(() => {
    const values = data.map((day) => day.inCents);
    const max = Math.max(1, ...values);
    return values.map((value, index) => ({
      x: (index / Math.max(1, values.length - 1)) * 320,
      y: 84 - (value / max) * 66,
    }));
  }, [data]);

  if (points.length < 2) return null;

  let line = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    const midX = (previous.x + current.x) / 2;
    line += ` C ${midX} ${previous.y}, ${midX} ${current.y}, ${current.x} ${current.y}`;
  }
  const area = `${line} L 320 100 L 0 100 Z`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox="0 0 320 100"
      preserveAspectRatio="none"
      className="h-[86px] w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="balance-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9F65D" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#C9F65D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#balance-spark)" />
      <path
        d={line}
        fill="none"
        stroke="#C9F65D"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last.x} cy={last.y} r="3" fill="#C9F65D" stroke="#0D1711" strokeWidth="2" />
    </svg>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-9 w-64 rounded-xl shimmer" />
      <div className="h-[252px] rounded-[26px] shimmer" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-[108px] rounded-2xl shimmer" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-[360px] rounded-2xl shimmer lg:col-span-2" />
        <div className="h-[360px] rounded-2xl shimmer" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, tone, label, value, detail }) {
  return (
    <div className="card flex items-start gap-3.5 p-5">
      <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', tone)}>
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      <div className="min-w-0">
        <p className="text-[11.5px] font-medium text-slate-ink">{label}</p>
        <p className="numeric mt-1 font-display text-[22px] font-semibold tracking-[-0.035em] text-ink">
          {value}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-ink/40">{detail}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle('Overview');
  const { user, refreshUser, updateUser } = useAuth();
  const { openAddMoney } = useOutletContext();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [range, setRange] = useState(30);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    try {
      const response = await api('/dashboard');
      setData(response);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handleUpdate = () => {
      load();
      refreshUser();
    };
    window.addEventListener('paylune:wallet-updated', handleUpdate);
    return () => window.removeEventListener('paylune:wallet-updated', handleUpdate);
  }, [load, refreshUser]);

  const stats = data?.stats;
  useEffect(() => {
    if (data && user && data.stats.balanceCents !== user.balanceCents) {
      updateUser({ ...user, balanceCents: data.stats.balanceCents });
    }
  }, [data, user, updateUser]);

  if (!data && !error) return <DashboardSkeleton />;

  if (error && !data) {
    return (
      <div className="card mx-auto mt-10 max-w-md p-8 text-center">
        <p className="font-display text-[22px] font-semibold text-ink">
          We couldn&apos;t load your dashboard
        </p>
        <p className="mt-2 text-[13px] text-slate-ink">{error}</p>
        <button type="button" onClick={load} className="btn btn-dark mt-5">
          Try again
        </button>
      </div>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'there';
  const primaryCard = data.cards[0];
  const quickContacts = data.contacts.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-ink/35">{formatDate(new Date().toISOString())}</p>
          <h1 className="app-title mt-2">
            {greeting()}, {firstName}.
          </h1>
          <p className="app-subtitle mt-1.5">Here&apos;s what&apos;s moving in your account.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={openAddMoney} className="btn btn-light btn-sm h-10">
            <Plus className="h-4 w-4" />
            Add money
          </button>
          <Link to="/app/send" className="btn btn-dark btn-sm h-10 px-4">
            <Send className="h-4 w-4" />
            Send money
          </Link>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[26px] bg-ink text-cream shadow-lift">
        <div
          className="pointer-events-none absolute -right-32 -top-44 h-[420px] w-[420px] rounded-full bg-lime/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.05) 0.8px, transparent 0.8px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(115deg, black, transparent 65%)',
          }}
          aria-hidden="true"
        />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-cream/40">
                Available balance
              </p>
              <button
                type="button"
                onClick={() => setBalanceHidden((current) => !current)}
                className="grid h-7 w-7 place-items-center rounded-full text-cream/35 transition hover:bg-white/10 hover:text-cream"
                aria-label={balanceHidden ? 'Show balance' : 'Hide balance'}
              >
                {balanceHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="numeric mt-2 font-display text-[42px] font-semibold leading-none tracking-[-0.045em] sm:text-[52px]">
              {balanceHidden ? '••••••' : usd(stats.balanceCents)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream/60">
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                USD account
              </span>
              <span className="text-[11.5px] text-cream/35">
                {user?.company || 'Personal account'}
              </span>
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <Link to="/app/send" className="btn btn-primary btn-sm h-10 px-4">
                <Send className="h-3.5 w-3.5" />
                Send
              </Link>
              <button
                type="button"
                onClick={openAddMoney}
                className="btn btn-outline btn-sm h-10 px-4"
              >
                <Plus className="h-3.5 w-3.5" />
                Add money
              </button>
              <Link
                to="/app/payment-links"
                className="inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium text-cream/55 transition hover:bg-white/[0.06] hover:text-cream"
              >
                <Link2 className="h-3.5 w-3.5" />
                Request a payment
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-cream/35">
                  Money in · 30 days
                </p>
                <p className="numeric mt-1.5 text-[22px] font-semibold tracking-[-0.03em]">
                  {usd(data.cashflow.reduce((sum, day) => sum + day.inCents, 0))}
                </p>
              </div>
              <span className="rounded-full bg-lime/15 px-2.5 py-1 text-[10px] font-semibold text-lime">
                + this month
              </span>
            </div>
            <div className="mt-4">
              <BalanceSpark data={data.cashflow} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-3.5">
              <div>
                <p className="text-[10px] text-cream/35">Money out · month</p>
                <p className="numeric mt-0.5 text-[12.5px] font-medium text-cream/80">
                  {usd(stats.monthOutCents)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-cream/35">Link payments</p>
                <p className="numeric mt-0.5 text-[12.5px] font-medium text-cream/80">
                  {stats.linkPayments} · {usdCompact(stats.linkCollectedCents)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={ArrowDownLeft}
          tone="bg-[#EAF7D3] text-[#47631B]"
          label="Money in this month"
          value={usd(stats.monthInCents)}
          detail="Transfers and link payments"
        />
        <StatCard
          icon={ArrowUpRight}
          tone="bg-[#F0F1E9] text-ink/65"
          label="Money out this month"
          value={usd(stats.monthOutCents)}
          detail="Transfers and fees"
        />
        <StatCard
          icon={Link2}
          tone="bg-[#E4F6EF] text-[#146B53]"
          label="Collected via links"
          value={usd(stats.linkCollectedCents)}
          detail={`${stats.activeLinks} active link${stats.activeLinks === 1 ? '' : 's'}`}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-[19px] font-semibold tracking-[-0.03em] text-ink">
                Cashflow
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-ink">
                Income and spending across your account
              </p>
            </div>
            <div className="inline-flex rounded-full border border-ink/[0.08] bg-[#F7F8F1] p-1">
              {[
                { label: '7D', value: 7 },
                { label: '30D', value: 30 },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRange(option.value)}
                  className={cx(
                    'rounded-full px-3 py-1.5 text-[11px] font-semibold transition',
                    range === option.value
                      ? 'bg-white text-ink shadow-sm'
                      : 'text-ink/45 hover:text-ink/75',
                  )}
                  aria-pressed={range === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <CashflowChart data={data.cashflow} range={range} />
          </div>
        </section>

        <section className="card flex flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-[19px] font-semibold tracking-[-0.03em] text-ink">
                Quick send
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-ink">People you pay often</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-lime/50 text-ink">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>

          {quickContacts.length ? (
            <ul className="mt-4 divide-y divide-ink/[0.05]">
              {quickContacts.map((contact) => (
                <li key={contact.email}>
                  <Link
                    to={`/app/send?email=${encodeURIComponent(contact.email)}`}
                    className="group flex items-center gap-3 py-3"
                  >
                    <Avatar name={contact.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {contact.name}
                      </span>
                      <span className="block truncate text-[11px] text-slate-ink">
                        {contact.email}
                      </span>
                    </span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/40 transition group-hover:border-ink/25 group-hover:bg-white group-hover:text-ink">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Send}
              title="No contacts yet"
              description="Send your first transfer and your recent recipients will show here."
              className="flex-1 py-8"
            />
          )}

          <Link
            to="/app/send"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-ink/10 py-2.5 text-[12.5px] font-semibold text-ink transition hover:border-ink/25 hover:bg-sand/40"
          >
            New transfer
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between gap-4 border-b border-ink/[0.06] px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-display text-[19px] font-semibold tracking-[-0.03em] text-ink">
                Recent activity
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-ink">Your latest six transactions</p>
            </div>
            <Link
              to="/app/transactions"
              className="inline-flex shrink-0 items-center gap-1 text-[12px] font-semibold text-ink/60 transition hover:text-ink"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-ink/[0.05] px-2 py-1 sm:px-3">
            {data.recent.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onClick={setSelected}
                className="rounded-xl px-3 py-3"
              />
            ))}
          </div>
          <div className="border-t border-ink/[0.06] bg-[#FBFCF7] px-5 py-3 sm:px-6">
            <p className="text-[10.5px] text-slate-ink">
              Every transaction is simulated and stored in your local demo ledger.
            </p>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section className="relative overflow-hidden rounded-2xl bg-ink p-5 text-cream sm:p-6">
            <div
              className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-lime/15 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-ink">
                <Link2 className="h-[18px] w-[18px]" />
              </span>
              <h2 className="mt-4 font-display text-[20px] font-semibold tracking-[-0.03em]">
                Get paid with a link
              </h2>
              <p className="mt-1.5 text-[12px] leading-5 text-cream/45">
                Share one URL. Collect fixed or flexible amounts without chasing invoices.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-cream/30">Active</p>
                  <p className="numeric mt-0.5 text-[18px] font-semibold">{stats.activeLinks}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-cream/30">
                    Collected
                  </p>
                  <p className="numeric mt-0.5 text-[18px] font-semibold">
                    {usdCompact(stats.linkCollectedCents)}
                  </p>
                </div>
              </div>
              <Link
                to="/app/payment-links"
                className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-lime transition hover:gap-2.5"
              >
                Manage payment links
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
                Your cards
              </h2>
              <Link
                to="/app/cards"
                className="text-[11.5px] font-semibold text-ink/50 transition hover:text-ink"
              >
                Manage
              </Link>
            </div>
            {primaryCard ? (
              <>
                <div className="mt-3">
                  <CardVisual card={primaryCard} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11.5px] text-slate-ink">
                    <CreditCard className="h-3.5 w-3.5" />
                    {data.cards.length} virtual card{data.cards.length === 1 ? '' : 's'}
                  </div>
                  {primaryCard.frozen ? (
                    <Badge tone="neutral">Frozen</Badge>
                  ) : (
                    <Badge tone="lime">Active</Badge>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-3 text-[12.5px] text-slate-ink">No cards yet.</p>
            )}
          </section>
        </div>
      </div>

      <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
