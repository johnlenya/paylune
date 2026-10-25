import { useEffect, useState } from 'react';
import { CreditCard, Lock, Plus, ShieldCheck, Snowflake, Sparkles, Wallet } from 'lucide-react';
import CardVisual from '../components/CardVisual';
import { Field, Modal, Spinner, Toggle } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { api } from '../lib/api';
import { cx, usd } from '../lib/format';

const COLORS = [
  { id: 'obsidian', name: 'Obsidian', swatch: 'bg-[#0D1711]' },
  { id: 'lime', name: 'Lime', swatch: 'bg-lime' },
  { id: 'violet', name: 'Violet', swatch: 'bg-[#5B4BB8]' },
  { id: 'coral', name: 'Coral', swatch: 'bg-[#F37A50]' },
];

const MAX_CARDS = 5;

function CreateCardModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const [label, setLabel] = useState('');
  const [brand, setBrand] = useState('visa');
  const [color, setColor] = useState('obsidian');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLabel('');
      setBrand('visa');
      setColor('obsidian');
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (label.trim().length < 1) {
      setError('Give your card a name.');
      return;
    }
    setSubmitting(true);
    try {
      const data = await api('/cards', {
        method: 'POST',
        body: { label: label.trim(), brand, color },
      });
      onCreated(data.card);
      toast.success(`Virtual card ending ${data.card.last4} is ready.`);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const preview = {
    label: label.trim() || 'New virtual card',
    brand,
    color,
    last4: '0000',
    expMonth: 12,
    expYear: new Date().getFullYear() + 4,
    frozen: false,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a virtual card"
      description="Use it for subscriptions, ads, and one-off purchases."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="rounded-2xl bg-[#F7F8F1] p-4">
          <div className="mx-auto max-w-[330px]">
            <CardVisual card={preview} />
          </div>
          <p className="mt-3 text-center text-[10.5px] text-slate-ink">
            Design preview · card details are generated on creation
          </p>
        </div>

        <Field label="Card name" htmlFor="card-label" error={error}>
          <input
            id="card-label"
            type="text"
            maxLength={30}
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Subscriptions, Ads, Travel"
            className="input"
            autoFocus
          />
        </Field>

        <div>
          <span className="field-label">Network</span>
          <div className="grid grid-cols-2 gap-2">
            {['visa', 'mastercard'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBrand(option)}
                aria-pressed={brand === option}
                className={cx(
                  'flex h-12 items-center justify-center rounded-xl border text-[13px] font-semibold uppercase tracking-[0.08em] transition',
                  brand === option
                    ? 'border-ink/30 bg-white text-ink ring-2 ring-lime/50'
                    : 'border-ink/10 bg-white text-ink/40 hover:border-ink/20',
                )}
              >
                {option === 'visa' ? 'Visa' : 'Mastercard'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="field-label">Colour</span>
          <div className="flex items-center gap-3">
            {COLORS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setColor(option.id)}
                className={cx(
                  'relative grid h-9 w-9 place-items-center rounded-full border-2 transition',
                  color === option.id ? 'border-ink' : 'border-transparent',
                )}
                aria-label={option.name}
                aria-pressed={color === option.id}
                title={option.name}
              >
                <span className={cx('h-6 w-6 rounded-full', option.swatch)} />
              </button>
            ))}
            <span className="ml-1 text-[11.5px] text-slate-ink">
              {COLORS.find((option) => option.id === color)?.name}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-lime/20 px-3.5 py-3 text-[11.5px] leading-5 text-ink/70">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Virtual cards are simulated for this demo. No real card is issued and nothing can be
          charged.
        </div>

        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <button type="submit" disabled={submitting} className="btn btn-dark flex-1">
            {submitting ? <Spinner /> : <Plus className="h-4 w-4" />}
            {submitting ? 'Creating card…' : 'Create card'}
          </button>
          <button type="button" onClick={onClose} disabled={submitting} className="btn btn-light flex-1">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Cards() {
  useDocumentTitle('Cards');
  const toast = useToast();
  const [cards, setCards] = useState(null);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api('/cards')
      .then((data) => {
        if (!active) return;
        setCards(data.cards);
        setError('');
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function toggleFreeze(card) {
    setUpdatingId(card.id);
    try {
      const data = await api(`/cards/${card.id}`, {
        method: 'PATCH',
        body: { frozen: !card.frozen },
      });
      setCards((current) => current.map((item) => (item.id === card.id ? data.card : item)));
      toast.info(
        data.card.frozen
          ? `Card ending ${data.card.last4} is frozen.`
          : `Card ending ${data.card.last4} is active again.`,
      );
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setUpdatingId('');
    }
  }

  const totalSpend = (cards || []).reduce((sum, card) => sum + card.spendCents, 0);
  const activeCount = (cards || []).filter((card) => !card.frozen).length;
  const atLimit = (cards?.length || 0) >= MAX_CARDS;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-ink/35">Spend</p>
          <h1 className="app-title mt-2">Cards</h1>
          <p className="app-subtitle mt-1.5">
            Create virtual cards for every corner of your work. Freeze one anytime.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          disabled={atLimit}
          className="btn btn-dark btn-sm h-10 self-start px-4 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New virtual card
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-3.5 p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F0ECFA] text-[#6248A8]">
            <CreditCard className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11.5px] text-slate-ink">Cards on this account</p>
            <p className="numeric mt-0.5 font-display text-[22px] font-semibold text-ink">
              {cards ? cards.length : '—'}
              <span className="ml-1 text-[12px] font-normal text-ink/35">/ {MAX_CARDS}</span>
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3.5 p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF7D3] text-[#47631B]">
            <Wallet className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11.5px] text-slate-ink">Active cards</p>
            <p className="numeric mt-0.5 font-display text-[22px] font-semibold text-ink">
              {cards ? activeCount : '—'}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3.5 p-5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#F0F1E9] text-ink/60">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11.5px] text-slate-ink">Spent on cards</p>
            <p className="numeric mt-0.5 font-display text-[22px] font-semibold text-ink">
              {cards ? usd(totalSpend) : '—'}
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="card p-10 text-center">
          <p className="text-[13px] text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
            className="btn btn-light btn-sm mt-4"
          >
            Try again
          </button>
        </div>
      ) : null}

      {!cards && !error ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="space-y-3">
              <div className="aspect-[1.62/1] w-full rounded-[22px] shimmer" />
              <div className="h-12 rounded-xl shimmer" />
            </div>
          ))}
        </div>
      ) : null}

      {cards ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <div key={card.id} className="group">
              <CardVisual card={card} />
              <div className="mt-3.5 rounded-2xl border border-ink/[0.07] bg-white px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-ink">
                      {card.label}
                      {updatingId === card.id ? (
                        <Spinner className="h-3 w-3 text-ink/30" label="Updating card" />
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-ink">
                      •••• {card.last4} · Exp {String(card.expMonth).padStart(2, '0')}/
                      {String(card.expYear).slice(-2)}
                    </p>
                  </div>
                  <span
                    className={cx(
                      'shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em]',
                      card.frozen
                        ? 'bg-ink/[0.05] text-ink/40'
                        : 'bg-emerald-50 text-emerald-700',
                    )}
                  >
                    {card.frozen ? 'Frozen' : 'Active'}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-ink/[0.05] pt-3">
                  <div>
                    <p className="text-[10px] text-slate-ink">Spent this month</p>
                    <p className="numeric text-[13px] font-semibold text-ink">{usd(card.spendCents)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-medium text-ink/45">
                      {card.frozen ? 'Frozen' : 'Freeze'}
                    </span>
                    <Toggle
                      checked={card.frozen}
                      onChange={() => toggleFreeze(card)}
                      disabled={updatingId === card.id}
                      label={`${card.frozen ? 'Unfreeze' : 'Freeze'} card ending ${card.last4}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!atLimit ? (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed border-ink/15 bg-white/40 px-6 py-10 text-center transition hover:border-ink/30 hover:bg-white md:min-h-0"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-ink/10 bg-white text-ink/50">
                <Plus className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[13.5px] font-semibold text-ink">Add another card</span>
                <span className="mt-1 block text-[11.5px] text-slate-ink">
                  {MAX_CARDS - cards.length} of {MAX_CARDS} slots remaining
                </span>
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Lock,
            title: 'Virtual by default',
            copy: 'No plastic in the post. Details are generated instantly and stay inside Paylune.',
          },
          {
            icon: Snowflake,
            title: 'Freeze in one tap',
            copy: 'Pause a card the moment something looks off. Unfreeze whenever you need it.',
          },
          {
            icon: ShieldCheck,
            title: 'Yours to control',
            copy: 'Every card on this page is simulated and linked only to your demo wallet.',
          },
        ].map((item) => (
          <div key={item.title} className="card p-5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#F7F8F1] text-ink/60">
              <item.icon className="h-4 w-4" />
            </span>
            <h2 className="mt-3 font-display text-[15px] font-semibold text-ink">{item.title}</h2>
            <p className="mt-1 text-[11.5px] leading-5 text-slate-ink">{item.copy}</p>
          </div>
        ))}
      </section>

      <p className="text-[10.5px] text-slate-ink">
        Paylune cards are a demo feature. No real card network is contacted and no charges occur.
      </p>

      <CreateCardModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(card) => setCards((current) => [...(current || []), card])}
      />
    </div>
  );
}
