import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  Unlink,
} from 'lucide-react';
import Logo from '../components/Logo';
import { Avatar, CopyButton, Spinner } from '../components/ui';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { api } from '../lib/api';
import { formatDateTime, parseAmountToCents, usd } from '../lib/format';

function PageShell({ children }) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-cream text-ink">
      <div
        className="pointer-events-none absolute -right-40 -top-48 h-[520px] w-[520px] rounded-full bg-lime/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-56 -left-40 h-[460px] w-[460px] rounded-full bg-[#DDEAC7]/50 blur-3xl"
        aria-hidden="true"
      />
      <header className="relative border-b border-ink/[0.06] bg-cream/70 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1080px] items-center justify-between px-5 sm:px-8">
          <Logo theme="light" to="/" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/45">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure demo checkout
          </span>
        </div>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>
      <footer className="relative pb-6 text-center text-[10.5px] text-ink/35">
        Paylune is a product demo. Payments on this page are simulated.
      </footer>
    </div>
  );
}

function ErrorState({ title, description }) {
  return (
    <div className="w-full max-w-md rounded-[28px] border border-ink/[0.07] bg-white p-8 text-center shadow-soft sm:p-10">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#F7F8F1] text-ink/45">
        <Unlink className="h-6 w-6" />
      </span>
      <h1 className="mt-5 font-display text-[24px] font-semibold tracking-[-0.035em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-[13px] leading-6 text-slate-ink">{description}</p>
      <Link to="/" className="btn btn-dark mt-6 w-full">
        <ArrowLeft className="h-4 w-4" />
        Back to Paylune
      </Link>
    </div>
  );
}

export default function PublicPay() {
  const { slug } = useParams();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useDocumentTitle(link ? `Pay ${link.title}` : 'Checkout');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(null);
    api(`/pay/${encodeURIComponent(slug)}`)
      .then((data) => {
        if (active) setLink(data.link);
      })
      .catch((error) => {
        if (active) setLoadError(error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug, reloadKey]);

  const flexible = Boolean(link && link.amountCents === null);
  const enteredCents = parseAmountToCents(amount);
  const effectiveCents = link ? link.amountCents ?? enteredCents : null;

  async function handlePay(event) {
    event.preventDefault();
    if (!link) return;
    if (payerName.trim().length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!effectiveCents || effectiveCents < 100) {
      setFormError('Enter an amount of at least $1.00.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const data = await api(`/pay/${encodeURIComponent(slug)}`, {
        method: 'POST',
        body: {
          payerName: payerName.trim(),
          payerEmail: payerEmail.trim().toLowerCase(),
          ...(flexible ? { amountCents: effectiveCents } : {}),
        },
      });
      setResult(data);
      window.scrollTo(0, 0);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center gap-2.5 text-[13px] text-slate-ink">
          <Spinner className="h-4 w-4 text-ink" label="Loading payment page" />
          Loading secure checkout…
        </div>
      </PageShell>
    );
  }

  if (loadError) {
    return (
      <PageShell>
        <div className="w-full max-w-md">
          <ErrorState
            title={
              loadError.status === 404 ? 'This link doesn’t exist' : 'Something went wrong'
            }
            description={
              loadError.status === 404
                ? 'Check the URL, or ask the sender for a fresh payment link.'
                : loadError.message
            }
          />
          {loadError.status !== 404 ? (
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="mx-auto mt-4 block text-[12px] font-semibold text-ink/50 transition hover:text-ink"
            >
              Try again
            </button>
          ) : null}
        </div>
      </PageShell>
    );
  }

  if (!link.active && !result) {
    return (
      <PageShell>
        <div className="w-full max-w-md rounded-[28px] border border-ink/[0.07] bg-white p-8 text-center shadow-soft sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-[24px] font-semibold tracking-[-0.035em] text-ink">
            This link is paused
          </h1>
          <p className="mt-2 text-[13px] leading-6 text-slate-ink">
            {link.ownerName} is not accepting payments through this link right now. Reach out
            directly, or ask for a new link.
          </p>
          <Link to="/" className="btn btn-dark mt-6 w-full">
            <ArrowLeft className="h-4 w-4" />
            Back to Paylune
          </Link>
        </div>
      </PageShell>
    );
  }

  const payeeLabel = link.ownerCompany || link.ownerName;

  return (
    <PageShell>
      <div className="grid w-full max-w-[1080px] overflow-hidden rounded-[28px] border border-ink/[0.07] bg-white shadow-lift lg:grid-cols-[0.88fr_1.12fr]">
        <aside className="relative overflow-hidden bg-ink p-6 text-cream sm:p-9">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-lime/10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.05) 0.8px, transparent 0.8px)',
              backgroundSize: '22px 22px',
              maskImage: 'linear-gradient(to bottom, black, transparent 60%)',
            }}
            aria-hidden="true"
          />

          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-2.5">
              <Avatar name={payeeLabel} size="md" />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-cream">{link.ownerName}</p>
                {link.ownerCompany ? (
                  <p className="truncate text-[10.5px] text-cream/40">{link.ownerCompany}</p>
                ) : null}
              </div>
              <span className="ml-auto shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-cream/45">
                Request
              </span>
            </div>

            <div className="mt-10">
              <p className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-lime/70">
                {result ? 'Payment complete' : 'You’re paying for'}
              </p>
              <h1 className="mt-2 font-display text-[30px] font-semibold leading-[1.12] tracking-[-0.04em] sm:text-[36px]">
                {link.title}
              </h1>
              {link.description ? (
                <p className="mt-3 max-w-sm text-[12.5px] leading-6 text-cream/45">
                  {link.description}
                </p>
              ) : null}

              <div className="mt-7 flex items-end gap-2">
                <p className="numeric font-display text-[42px] font-semibold leading-none tracking-[-0.045em] sm:text-[48px]">
                  {result
                    ? usd(result.amountCents)
                    : link.amountCents
                      ? usd(link.amountCents)
                      : enteredCents
                        ? usd(enteredCents)
                        : '$0.00'}
                </p>
                <span className="pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cream/35">
                  USD
                </span>
              </div>
              <p className="mt-2 text-[11px] text-cream/35">
                {flexible ? 'Enter the amount you’d like to pay' : 'Fixed amount set by the seller'}
              </p>
            </div>

            <div className="mt-auto pt-10">
              <div className="space-y-3 border-t border-white/[0.08] pt-5 text-[11px]">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-cream/35">Paid to</span>
                  <span className="font-medium text-cream/80">{link.ownerName}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-cream/35">Fee</span>
                  <span className="font-medium text-cream/80">None</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-cream/35">Settlement</span>
                  <span className="font-medium text-cream/80">Instant</span>
                </div>
              </div>
              <p className="mt-5 flex items-start gap-2 text-[10px] leading-4 text-cream/25">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Paylune never asks for sensitive card details in the demo. No real money moves.
              </p>
            </div>
          </div>
        </aside>

        <section className="bg-white p-6 sm:p-9">
          {result ? (
            <div className="flex h-full flex-col justify-center text-center">
              <span className="animate-pop mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime text-ink">
                <CheckCircle2 className="h-8 w-8" strokeWidth={1.7} />
              </span>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-ink">
                Payment complete
              </p>
              <p className="numeric mt-1.5 font-display text-[38px] font-semibold tracking-[-0.04em] text-ink">
                {usd(result.amountCents)}
              </p>
              <p className="mt-1 text-[12.5px] text-slate-ink">
                Thank you — your payment for “{result.title}” to {result.payeeName} is complete.
              </p>

              <div className="mt-6 rounded-2xl border border-ink/[0.06] bg-[#FBFCF7] px-4 py-1 text-left text-[12.5px]">
                <div className="flex items-center justify-between gap-4 border-b border-ink/[0.06] py-3">
                  <span className="text-slate-ink">Paid to</span>
                  <span className="text-right font-medium text-ink">
                    {result.payeeCompany || result.payeeName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-ink/[0.06] py-3">
                  <span className="text-slate-ink">Date</span>
                  <span className="text-right font-medium text-ink">
                    {formatDateTime(result.paidAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-ink/[0.06] py-3">
                  <span className="text-slate-ink">Paid by</span>
                  <span className="max-w-[60%] truncate text-right font-medium text-ink">
                    {payerEmail || payerName}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-slate-ink">Reference</span>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium text-ink">
                    {result.reference}
                    <CopyButton
                      value={result.reference}
                      showLabel={false}
                      className="inline-grid h-6 w-6 place-items-center rounded-md text-ink/40 transition hover:bg-ink/5 hover:text-ink"
                    />
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-lime/20 px-4 py-3 text-[11px] leading-5 text-ink/65">
                This was a simulated payment. No funds were transferred and no card was charged.
              </div>

              <Link to="/" className="btn btn-dark mt-5 w-full">
                Back to Paylune
              </Link>
              <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-[10px] text-ink/30">
                <Sparkles className="h-3 w-3" />
                Demo checkout · powered by Paylune
              </p>
            </div>
          ) : (
            <form onSubmit={handlePay} noValidate>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/35">
                    Checkout
                  </p>
                  <h2 className="mt-1 font-display text-[23px] font-semibold tracking-[-0.035em] text-ink">
                    Pay {payeeLabel}
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7F8F1] px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink/45">
                  <Lock className="h-3 w-3" />
                  Simulated
                </span>
              </div>

              {formError ? (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12px] leading-5 text-red-700"
                >
                  {formError}
                </div>
              ) : null}

              <div className="mt-5 space-y-4">
                <div>
                  <label htmlFor="payer-name" className="field-label">
                    Your name
                  </label>
                  <input
                    id="payer-name"
                    type="text"
                    autoComplete="name"
                    maxLength={60}
                    value={payerName}
                    onChange={(event) => {
                      setPayerName(event.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="Full name"
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="payer-email" className="field-label">
                    Email for your receipt
                  </label>
                  <input
                    id="payer-email"
                    type="email"
                    autoComplete="email"
                    maxLength={120}
                    value={payerEmail}
                    onChange={(event) => {
                      setPayerEmail(event.target.value);
                      if (formError) setFormError('');
                    }}
                    placeholder="you@company.com"
                    className="input"
                  />
                </div>

                {flexible ? (
                  <div>
                    <label htmlFor="payer-amount" className="field-label">
                      Amount to pay
                    </label>
                    <div className="flex items-center rounded-xl border border-ink/10 bg-white px-4 transition focus-within:border-ink/25 focus-within:ring-4 focus-within:ring-lime/40">
                      <span className="font-display text-[22px] font-medium text-ink/35">$</span>
                      <input
                        id="payer-amount"
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(event) => {
                          const cleaned = event.target.value
                            .replace(/[^\d.]/g, '')
                            .replace(/(\..*)\./g, '$1')
                            .replace(/^(\d*\.?\d{0,2}).*$/, '$1');
                          setAmount(cleaned);
                          if (formError) setFormError('');
                        }}
                        placeholder="0.00"
                        className="numeric h-14 w-0 min-w-0 flex-1 bg-transparent px-2 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink outline-none placeholder:text-ink/20"
                      />
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink/35">
                        USD
                      </span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      {['50', '100', '250'].map((quick) => (
                        <button
                          key={quick}
                          type="button"
                          onClick={() => setAmount(quick)}
                          className="rounded-full border border-ink/10 px-3 py-1 text-[10.5px] font-semibold text-ink/50 transition hover:border-ink/25 hover:text-ink"
                        >
                          ${quick}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-5">
                <span className="field-label">Payment method</span>
                <div className="flex items-center gap-3 rounded-xl border border-ink/25 bg-[#FAFBF5] px-3.5 py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-cream">
                    <CreditCard className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-ink">Paylune test card</p>
                    <p className="text-[10.5px] text-slate-ink">Visa ···· 4242 · Exp 12/29</p>
                  </div>
                  <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-ink text-lime">
                    <CheckCircle2 className="h-3 w-3" />
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-ink">
                  A demo card is used automatically. No card details are collected.
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-ink/[0.06] bg-[#FBFCF7] px-4 py-1 text-[12.5px]">
                <div className="flex items-center justify-between border-b border-ink/[0.06] py-3">
                  <span className="text-slate-ink">Amount</span>
                  <span className="numeric font-medium text-ink">
                    {effectiveCents ? usd(effectiveCents) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-ink/[0.06] py-3">
                  <span className="text-slate-ink">Processing fee</span>
                  <span className="font-medium text-emerald-700">Free</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="font-medium text-ink">Total</span>
                  <span className="numeric font-semibold text-ink">
                    {effectiveCents ? usd(effectiveCents) : '—'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !effectiveCents}
                className="btn btn-primary mt-4 w-full py-3.5"
              >
                {submitting ? <Spinner /> : <Lock className="h-4 w-4" />}
                {submitting
                  ? 'Processing…'
                  : effectiveCents
                    ? `Pay ${usd(effectiveCents)}`
                    : 'Pay'}
              </button>

              <p className="mt-3 text-center text-[10px] leading-4 text-ink/35">
                By paying, you agree this is a simulated transaction for demonstration purposes.
                No real charge will occur.
              </p>
            </form>
          )}
        </section>
      </div>
    </PageShell>
  );
}
