import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  ReceiptText,
  Search,
  Send,
  X,
} from 'lucide-react';
import { EmptyState, Spinner } from '../components/ui';
import TransactionItem from '../components/TransactionItem';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { api } from '../lib/api';
import { cx, monthKey, monthLabel, usd } from '../lib/format';

const FILTERS = [
  { id: 'all', label: 'All activity' },
  { id: 'in', label: 'Money in' },
  { id: 'out', label: 'Money out' },
  { id: 'payment_link', label: 'Payment links' },
  { id: 'topup', label: 'Top-ups' },
];

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(transactions) {
  const header = [
    'Date',
    'Type',
    'Counterparty',
    'Email',
    'Description',
    'Amount (USD)',
    'Fee (USD)',
    'Status',
    'Reference',
  ];
  const lines = [header.join(',')];
  transactions.forEach((transaction) => {
    lines.push(
      [
        new Date(transaction.createdAt).toISOString(),
        transaction.type,
        transaction.counterpartyName || '',
        transaction.counterpartyEmail || '',
        transaction.description || '',
        (transaction.amountCents / 100).toFixed(2),
        (transaction.feeCents / 100).toFixed(2),
        transaction.status,
        transaction.reference,
      ]
        .map(csvEscape)
        .join(','),
    );
  });
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `paylune-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function Transactions() {
  useDocumentTitle('Transactions');
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [filter, setFilter] = useState('all');
  const [searchInput, setSearchInput] = useState(urlQuery);
  const [query, setQuery] = useState(urlQuery);
  const [transactions, setTransactions] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSearchInput(urlQuery);
    setQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchInput.trim()), 320);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (query === urlQuery) return;
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (query) next.set('q', query);
        else next.delete('q');
        return next;
      },
      { replace: true },
    );
  }, [query, urlQuery, setSearchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = new URLSearchParams({ type: filter, limit: '200' });
    if (query) params.set('search', query);

    api(`/transactions?${params.toString()}`)
      .then((data) => {
        if (!active) return;
        setTransactions(data.transactions);
        setTotal(data.total);
        setError('');
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter, query, reloadKey]);

  const summary = useMemo(() => {
    const rows = transactions || [];
    return rows.reduce(
      (accumulator, transaction) => {
        if (transaction.amountCents > 0) accumulator.inCents += transaction.amountCents;
        else accumulator.outCents += Math.abs(transaction.amountCents);
        return accumulator;
      },
      { inCents: 0, outCents: 0 },
    );
  }, [transactions]);

  const groups = useMemo(() => {
    const map = new Map();
    (transactions || []).forEach((transaction) => {
      const key = monthKey(transaction.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(transaction);
    });
    return [...map.entries()];
  }, [transactions]);

  const hasFilters = filter !== 'all' || Boolean(query);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-ink/35">Ledger</p>
          <h1 className="app-title mt-2">Transactions</h1>
          <p className="app-subtitle mt-1.5">
            Every dollar in and out of your Paylune account, in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => downloadCsv(transactions || [])}
            disabled={!transactions?.length}
            className="btn btn-light btn-sm h-10"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <Link to="/app/send" className="btn btn-dark btn-sm h-10 px-4">
            <Send className="h-4 w-4" />
            Send money
          </Link>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-ink/[0.06] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
              {FILTERS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  className={cx(
                    'shrink-0 rounded-full px-3.5 py-2 text-[11.5px] font-semibold transition',
                    filter === option.id
                      ? 'bg-ink text-cream'
                      : 'text-ink/50 hover:bg-ink/[0.04] hover:text-ink',
                  )}
                  aria-pressed={filter === option.id}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="relative sm:w-[260px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/30" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name, note, ref"
                aria-label="Search transactions"
                className="h-9 w-full rounded-full border border-ink/[0.08] bg-[#FBFCF7] pl-9 pr-9 text-[12px] text-ink outline-none transition placeholder:text-ink/30 focus:border-ink/20 focus:bg-white focus:ring-4 focus:ring-lime/30"
              />
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-ink/35 transition hover:bg-ink/5 hover:text-ink"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-[#FBFCF7] px-4 py-2.5 text-[11.5px]">
            <span className="inline-flex items-center gap-1.5 text-slate-ink">
              <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
              In view
              <span className="numeric font-semibold text-emerald-700">{usd(summary.inCents)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-ink">
              <ArrowUpRight className="h-3.5 w-3.5 text-ink/45" />
              Out
              <span className="numeric font-semibold text-ink">{usd(summary.outCents)}</span>
            </span>
            <span className="ml-auto text-ink/35">
              {loading ? 'Loading…' : `${transactions?.length || 0} shown${total > (transactions?.length || 0) ? ` of ${total}` : ''}`}
            </span>
          </div>
        </div>

        {loading && !transactions ? (
          <div className="divide-y divide-ink/[0.05] px-3 py-2">
            {[0, 1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="flex items-center gap-3 px-3 py-4">
                <span className="h-10 w-10 rounded-full shimmer" />
                <span className="flex-1 space-y-2">
                  <span className="block h-3 w-40 rounded-full shimmer" />
                  <span className="block h-2.5 w-24 rounded-full shimmer" />
                </span>
                <span className="h-3 w-16 rounded-full shimmer" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-12 text-center">
            <p className="text-[13px] text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="btn btn-light btn-sm mt-4"
            >
              Try again
            </button>
          </div>
        ) : transactions?.length ? (
          <div className="px-2 pb-2 sm:px-3">
            {groups.map(([key, rows]) => {
              const monthIn = rows.reduce(
                (sum, row) => sum + (row.amountCents > 0 ? row.amountCents : 0),
                0,
              );
              const monthOut = rows.reduce(
                (sum, row) => sum + (row.amountCents < 0 ? Math.abs(row.amountCents) : 0),
                0,
              );
              return (
                <section key={key}>
                  <div className="sticky top-[70px] z-10 flex items-center justify-between gap-3 bg-white/95 px-3 pb-2 pt-4 backdrop-blur">
                    <h2 className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                      {monthLabel(rows[0].createdAt)}
                    </h2>
                    <p className="numeric text-[10.5px] text-ink/35">
                      <span className="text-emerald-700">+{usd(monthIn)}</span>
                      <span className="mx-1.5">·</span>
                      <span>−{usd(monthOut)}</span>
                    </p>
                  </div>
                  <div className="divide-y divide-ink/[0.05]">
                    {rows.map((transaction) => (
                      <TransactionItem
                        key={transaction.id}
                        transaction={transaction}
                        onClick={setSelected}
                        showStatus
                        className="rounded-xl px-3 py-3.5"
                      />
                    ))}
                  </div>
                </section>
              );
            })}
            <p className="border-t border-ink/[0.06] px-3 py-4 text-center text-[10.5px] text-slate-ink">
              Showing up to 200 matching transactions. Export for the full view.
            </p>
          </div>
        ) : (
          <EmptyState
            icon={ReceiptText}
            title={hasFilters ? 'No matching transactions' : 'No transactions yet'}
            description={
              hasFilters
                ? 'Try a different filter or search term.'
                : 'Send money, add funds, or get paid with a link to start your ledger.'
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setFilter('all');
                    setSearchInput('');
                  }}
                  className="btn btn-light btn-sm"
                >
                  Clear filters
                </button>
              ) : (
                <Link to="/app/send" className="btn btn-dark btn-sm">
                  Send money
                </Link>
              )
            }
          />
        )}
      </div>

      {loading && transactions ? (
        <div className="flex items-center justify-center gap-2 text-[11.5px] text-slate-ink">
          <Spinner className="h-3.5 w-3.5" /> Updating results…
        </div>
      ) : null}

      <p className="text-[10.5px] text-slate-ink">
        Amounts shown exclude fees unless marked. Balances and transactions are simulated.
      </p>

      <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
