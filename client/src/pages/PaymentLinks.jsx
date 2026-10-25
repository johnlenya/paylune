import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  Link2,
  Plus,
  ReceiptText,
  Users,
} from 'lucide-react';
import {
  Badge,
  CopyButton,
  EmptyState,
  Field,
  InlineNote,
  Modal,
  Spinner,
  Toggle,
} from '../components/ui';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { api } from '../lib/api';
import { cx, formatDate, usd } from '../lib/format';

function shareUrl(slug) {
  return `${window.location.origin}/pay/${slug}`;
}

function CreateLinkModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('fixed');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setMode('fixed');
      setAmount('');
      setError('');
      setSubmitting(false);
      setCreated(null);
    }
  }, [open]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (title.trim().length < 3) {
      setError('Give your link a title of at least 3 characters.');
      return;
    }
    const amountCents =
      mode === 'fixed' ? Math.round(Number(amount.replace(/[^\d.]/g, '')) * 100) : null;
    if (mode === 'fixed' && (!amountCents || amountCents < 100)) {
      setError('Enter a fixed amount of at least $1.00, or switch to customer-entered amounts.');
      return;
    }
    if (mode === 'fixed' && amountCents > 5000000) {
      setError('Payment links are limited to $50,000.00.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await api('/links', {
        method: 'POST',
        body: {
          title: title.trim(),
          description: description.trim(),
          amountCents,
          active: true,
        },
      });
      setCreated(data.link);
      onCreated(data.link);
      toast.success('Payment link created.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={created ? 'Payment link ready' : 'New payment link'}
      description={
        created
          ? 'Share it anywhere — the page handles the rest.'
          : 'Set a price, add context, and share one URL.'
      }
      size="md"
    >
      {created ? (
        <div className="text-center">
          <span className="animate-pop mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime text-ink">
            <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <h3 className="mt-4 font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">
            {created.title}
          </h3>
          <p className="mt-1 text-[12.5px] text-slate-ink">
            {created.amountCents ? `${usd(created.amountCents)} · fixed amount` : 'Customer chooses amount'}
          </p>

          <div className="mt-5 rounded-xl border border-ink/10 bg-[#FBFCF7] p-2.5">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2.5 text-left font-mono text-[11.5px] text-ink/70 ring-1 ring-ink/[0.05]">
                {shareUrl(created.slug)}
              </span>
              <CopyButton
                value={shareUrl(created.slug)}
                label="Copy"
                className="btn btn-dark btn-sm shrink-0"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onClose} className="btn btn-light flex-1">
              Done
            </button>
            <a
              href={shareUrl(created.slug)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-dark flex-1"
            >
              View public page
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setCreated(null)}
            className="mt-4 text-[11.5px] font-semibold text-ink/45 transition hover:text-ink"
          >
            Create another link
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Field label="Title" htmlFor="link-title" error={error}>
            <input
              id="link-title"
              type="text"
              maxLength={80}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Brand sprint deposit"
              className="input"
              autoFocus
            />
          </Field>

          <Field
            label="Description"
            htmlFor="link-description"
            hint={`${description.length}/240 · tell the payer what this is for`}
          >
            <textarea
              id="link-description"
              rows={3}
              maxLength={240}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="A short note shown on the checkout page."
              className="textarea"
            />
          </Field>

          <div>
            <span className="field-label">Amount</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'fixed', label: 'Fixed amount', detail: 'You set the price' },
                { id: 'flexible', label: 'Customer chooses', detail: 'They enter any amount' },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setMode(option.id);
                    if (error) setError('');
                  }}
                  aria-pressed={mode === option.id}
                  className={cx(
                    'rounded-xl border px-3.5 py-3 text-left transition',
                    mode === option.id
                      ? 'border-ink/30 bg-[#FAFBF5] ring-2 ring-lime/40'
                      : 'border-ink/[0.08] bg-white hover:border-ink/20',
                  )}
                >
                  <span className="block text-[12.5px] font-semibold text-ink">{option.label}</span>
                  <span className="mt-0.5 block text-[10.5px] text-slate-ink">{option.detail}</span>
                </button>
              ))}
            </div>
          </div>

          {mode === 'fixed' ? (
            <div>
              <label htmlFor="link-amount" className="field-label">
                Price
              </label>
              <div className="flex items-center rounded-xl border border-ink/10 bg-white px-4 transition focus-within:border-ink/25 focus-within:ring-4 focus-within:ring-lime/40">
                <span className="font-display text-[22px] font-medium text-ink/35">$</span>
                <input
                  id="link-amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    const cleaned = event.target.value
                      .replace(/[^\d.]/g, '')
                      .replace(/(\..*)\./g, '$1')
                      .replace(/^(\d*\.?\d{0,2}).*$/, '$1');
                    setAmount(cleaned);
                    if (error) setError('');
                  }}
                  placeholder="0.00"
                  className="numeric h-14 w-0 min-w-0 flex-1 bg-transparent px-2 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink outline-none placeholder:text-ink/20"
                />
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink/35">
                  USD
                </span>
              </div>
            </div>
          ) : null}

          <InlineNote>
            Payment links work for Paylune members and anyone with the URL. No account is required
            for the payer.
          </InlineNote>

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <button type="submit" disabled={submitting} className="btn btn-dark flex-1">
              {submitting ? <Spinner /> : <Link2 className="h-4 w-4" />}
              {submitting ? 'Creating link…' : 'Create link'}
            </button>
            <button type="button" onClick={onClose} disabled={submitting} className="btn btn-light flex-1">
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default function PaymentLinks() {
  useDocumentTitle('Payment links');
  const toast = useToast();
  const [links, setLinks] = useState(null);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api('/links')
      .then((data) => {
        if (!active) return;
        setLinks(data.links);
        setError('');
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  async function toggleLink(link) {
    setUpdatingId(link.id);
    try {
      const data = await api(`/links/${link.id}`, {
        method: 'PATCH',
        body: { active: !link.active },
      });
      setLinks((current) =>
        current.map((item) => (item.id === link.id ? data.link : item)),
      );
      toast.info(data.link.active ? 'Payment link is live again.' : 'Payment link paused.');
    } catch (requestError) {
      toast.error(requestError.message);
    } finally {
      setUpdatingId('');
    }
  }

  const stats = (links || []).reduce(
    (accumulator, link) => {
      if (link.active) accumulator.active += 1;
      accumulator.payments += link.paidCount;
      accumulator.collected += link.totalCollectedCents;
      return accumulator;
    },
    { active: 0, payments: 0, collected: 0 },
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-ink/35">Get paid</p>
          <h1 className="app-title mt-2">Payment links</h1>
          <p className="app-subtitle mt-1.5">
            One link. Any amount. Built for quick invoices, deposits, and repeat clients.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="btn btn-dark btn-sm h-10 self-start px-4 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New payment link
        </button>
      </div>

      <section className="card grid grid-cols-3 divide-x divide-ink/[0.06] overflow-hidden">
        {[
          {
            icon: Link2,
            label: 'Active links',
            value: links ? stats.active : '—',
          },
          {
            icon: Users,
            label: 'Payments received',
            value: links ? stats.payments : '—',
          },
          {
            icon: CircleDollarSign,
            label: 'Total collected',
            value: links ? usd(stats.collected) : '—',
          },
        ].map((stat) => (
          <div key={stat.label} className="px-4 py-4 sm:px-6 sm:py-5">
            <span className="hidden h-8 w-8 place-items-center rounded-lg bg-[#F7F8F1] text-ink/50 sm:grid">
              <stat.icon className="h-4 w-4" />
            </span>
            <p className="text-[10.5px] text-slate-ink sm:mt-2.5">{stat.label}</p>
            <p className="numeric mt-0.5 font-display text-[19px] font-semibold tracking-[-0.03em] text-ink sm:text-[22px]">
              {stat.value}
            </p>
          </div>
        ))}
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

      {!links && !error ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="h-[260px] rounded-2xl shimmer" />
          ))}
        </div>
      ) : null}

      {links?.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {links.map((link) => (
            <article
              key={link.id}
              className={cx(
                'card relative flex flex-col overflow-hidden p-5 transition sm:p-6',
                !link.active && 'bg-[#FAFBF6]',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cx(
                      'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                      link.active ? 'bg-lime/55 text-ink' : 'bg-ink/[0.05] text-ink/35',
                    )}
                  >
                    <Link2 className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-[16px] font-semibold tracking-[-0.02em] text-ink">
                      {link.title}
                    </h2>
                    <p className="mt-0.5 truncate font-mono text-[10.5px] text-ink/35">
                      /pay/{link.slug}
                    </p>
                  </div>
                </div>
                <Badge tone={link.active ? 'success' : 'neutral'} className="shrink-0">
                  <span
                    className={cx(
                      'h-1.5 w-1.5 rounded-full',
                      link.active ? 'bg-emerald-500' : 'bg-ink/30',
                    )}
                  />
                  {link.active ? 'Live' : 'Paused'}
                </Badge>
              </div>

              {link.description ? (
                <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-slate-ink">
                  {link.description}
                </p>
              ) : (
                <p className="mt-3 text-[12px] italic text-ink/30">No description</p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#FBFCF7] px-3.5 py-3">
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Amount</p>
                  <p className="numeric mt-0.5 text-[12.5px] font-semibold text-ink">
                    {link.amountCents ? usd(link.amountCents) : 'Flexible'}
                  </p>
                </div>
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Payments</p>
                  <p className="numeric mt-0.5 text-[12.5px] font-semibold text-ink">
                    {link.paidCount}
                  </p>
                </div>
                <div>
                  <p className="text-[9.5px] uppercase tracking-[0.1em] text-ink/35">Collected</p>
                  <p className="numeric mt-0.5 text-[12.5px] font-semibold text-ink">
                    {usd(link.totalCollectedCents)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/[0.06] pt-4">
                <div className="flex items-center gap-1.5">
                  <CopyButton
                    value={shareUrl(link.slug)}
                    label="Copy link"
                    className="btn btn-light btn-sm h-9 px-3"
                  />
                  <a
                    href={shareUrl(link.slug)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-ink/45 transition hover:border-ink/25 hover:bg-white hover:text-ink"
                    aria-label={`Open public page for ${link.title}`}
                    title="Open public page"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  {updatingId === link.id ? (
                    <Spinner className="h-3.5 w-3.5 text-ink/30" label="Updating link" />
                  ) : null}
                  <span className="text-[10.5px] font-medium text-ink/40">
                    {link.active ? 'Accepting' : 'Paused'}
                  </span>
                  <Toggle
                    checked={link.active}
                    onChange={() => toggleLink(link)}
                    disabled={updatingId === link.id}
                    label={`${link.active ? 'Pause' : 'Activate'} ${link.title}`}
                  />
                </div>
              </div>

              <p className="mt-3 text-[9.5px] text-ink/25">Created {formatDate(link.createdAt)}</p>
            </article>
          ))}

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex min-h-[210px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink/15 bg-white/40 px-6 py-10 text-center transition hover:border-ink/30 hover:bg-white"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-ink/10 bg-white text-ink/50">
              <Plus className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[13.5px] font-semibold text-ink">Create another link</span>
              <span className="mt-1 block text-[11.5px] text-slate-ink">
                Fixed or customer-entered amounts
              </span>
            </span>
          </button>
        </div>
      ) : null}

      {links && !links.length ? (
        <div className="card">
          <EmptyState
            icon={ReceiptText}
            title="No payment links yet"
            description="Create a link, share it anywhere, and watch payments land in your balance."
            action={
              <button type="button" onClick={() => setCreateOpen(true)} className="btn btn-dark btn-sm">
                <Plus className="h-3.5 w-3.5" />
                Create your first link
              </button>
            }
          />
        </div>
      ) : null}

      <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-ink/[0.07] bg-white px-5 py-4 sm:flex-row sm:items-center">
        <p className="flex items-start gap-2.5 text-[11.5px] leading-5 text-slate-ink">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-lime/40 text-ink">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
          Share a link in an email, chat, or proposal. Payers can use any name and email — no Paylune
          account needed.
        </p>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="shrink-0 text-[12px] font-semibold text-ink transition hover:text-ink/70"
        >
          New link →
        </button>
      </div>

      <CreateLinkModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(link) => setLinks((current) => [link, ...(current || [])])}
      />
    </div>
  );
}
