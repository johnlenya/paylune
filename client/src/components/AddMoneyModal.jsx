import { useEffect, useState } from 'react';
import { Building2, Check, CreditCard, Smartphone, Zap } from 'lucide-react';
import { Modal, Spinner } from './ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../lib/api';
import { cx, parseAmountToCents, usd } from '../lib/format';

const QUICK_AMOUNTS = ['100', '500', '1000', '2500'];

const SOURCES = [
  {
    id: 'kcb',
    name: 'KCB Bank',
    detail: '•• 4821',
    source: 'KCB Bank •• 4821',
    icon: Building2,
  },
  {
    id: 'mpesa',
    name: 'M-Pesa',
    detail: 'Mobile wallet',
    source: 'M-Pesa wallet',
    icon: Smartphone,
  },
  {
    id: 'visa',
    name: 'Visa debit',
    detail: '•• 9930',
    source: 'Visa debit •• 9930',
    icon: CreditCard,
  },
];

export default function AddMoneyModal({ open, onClose }) {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [amount, setAmount] = useState('');
  const [sourceId, setSourceId] = useState(SOURCES[0].id);
  const [amountError, setAmountError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount('');
      setSourceId(SOURCES[0].id);
      setAmountError('');
      setSubmitting(false);
    }
  }, [open]);

  const cents = parseAmountToCents(amount);
  const selectedSource = SOURCES.find((source) => source.id === sourceId) || SOURCES[0];

  function handleAmountChange(event) {
    const raw = event.target.value;
    const cleaned = raw
      .replace(/[^\d.]/g, '')
      .replace(/(\..*)\./g, '$1')
      .replace(/^(\d*\.?\d{0,2}).*$/, '$1');
    setAmount(cleaned);
    if (amountError) setAmountError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!cents || cents < 100) {
      setAmountError('Enter an amount of at least $1.00.');
      return;
    }
    if (cents > 5000000) {
      setAmountError('Top-ups are limited to $50,000.00 in this demo.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await api('/wallet/topup', {
        method: 'POST',
        body: { amountCents: cents, source: selectedSource.source },
      });
      updateUser(data.user);
      window.dispatchEvent(new Event('paylune:wallet-updated'));
      toast.success(`${usd(cents)} added to your Paylune balance.`);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add money"
      description="Top up your Paylune balance instantly."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center justify-between rounded-xl bg-[#F7F8F1] px-4 py-3">
          <span className="text-[12px] text-slate-ink">Available balance</span>
          <span className="numeric text-[13px] font-semibold text-ink">
            {usd(user?.balanceCents || 0)}
          </span>
        </div>

        <div>
          <label htmlFor="topup-amount" className="field-label">
            Amount
          </label>
          <div
            className={cx(
              'flex items-center rounded-2xl border bg-white px-4 transition focus-within:ring-4 focus-within:ring-lime/40',
              amountError ? 'border-red-300' : 'border-ink/10 focus-within:border-ink/25',
            )}
          >
            <span className="font-display text-[28px] font-medium text-ink/35">$</span>
            <input
              id="topup-amount"
              type="text"
              inputMode="decimal"
              autoFocus
              value={amount}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="numeric h-[68px] w-0 min-w-0 flex-1 bg-transparent px-2 font-display text-[32px] font-semibold tracking-[-0.04em] text-ink outline-none placeholder:text-ink/20"
              aria-describedby={amountError ? 'topup-amount-error' : undefined}
            />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/35">
              USD
            </span>
          </div>
          {amountError ? (
            <p id="topup-amount-error" className="mt-1.5 text-[12px] font-medium text-red-600">
              {amountError}
            </p>
          ) : null}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((quickAmount) => (
              <button
                key={quickAmount}
                type="button"
                onClick={() => setAmount(quickAmount)}
                className={cx(
                  'rounded-full border px-3 py-1.5 text-[11px] font-semibold transition',
                  amount === quickAmount
                    ? 'border-ink bg-ink text-cream'
                    : 'border-ink/10 bg-white text-ink/60 hover:border-ink/25 hover:text-ink',
                )}
              >
                ${Number(quickAmount).toLocaleString('en-US')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="field-label">Funding source</span>
          <div className="space-y-2">
            {SOURCES.map((source) => {
              const Icon = source.icon;
              const selected = sourceId === source.id;
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSourceId(source.id)}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition',
                    selected
                      ? 'border-ink/30 bg-[#FAFBF5]'
                      : 'border-ink/[0.08] bg-white hover:border-ink/20',
                  )}
                  aria-pressed={selected}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-sand/80 text-ink/70">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-medium text-ink">{source.name}</span>
                    <span className="block text-[11px] text-slate-ink">
                      {source.detail} · Instant
                    </span>
                  </span>
                  <span
                    className={cx(
                      'grid h-[18px] w-[18px] place-items-center rounded-full border transition',
                      selected ? 'border-ink bg-ink text-lime' : 'border-ink/20 bg-white',
                    )}
                  >
                    {selected ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11.5px] text-slate-ink">
          <Zap className="h-3.5 w-3.5 text-ink/40" />
          No fees · Arrives instantly
        </div>

        <button type="submit" disabled={submitting} className="btn btn-dark w-full py-3.5">
          {submitting ? <Spinner /> : null}
          {submitting ? 'Adding money…' : `Add ${cents ? usd(cents) : 'money'}`}
        </button>

        <p className="text-center text-[10.5px] leading-4 text-slate-ink">
          Demo funds only. No real money is moved or charged.
        </p>
      </form>
    </Modal>
  );
}
