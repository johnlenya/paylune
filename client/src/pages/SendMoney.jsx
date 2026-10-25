import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Info,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { Avatar, Field, InlineNote, Modal, Spinner } from '../components/ui';
import { CopyButton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { api } from '../lib/api';
import { cx, parseAmountToCents, usd } from '../lib/format';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QUICK_AMOUNTS = ['50', '100', '250', '500'];

function lookupFee(amountCents, member) {
  if (!amountCents) return 0;
  return member ? 0 : Math.max(25, Math.round(amountCents * 0.01));
}

export default function SendMoney() {
  useDocumentTitle('Send money');
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [toEmail, setToEmail] = useState(searchParams.get('email') || '');
  const [toName, setToName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [lookup, setLookup] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    api('/contacts')
      .then((data) => {
        if (active) setContacts(data.contacts.slice(0, 4));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const email = toEmail.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      setLookup(null);
      setLookupLoading(false);
      return undefined;
    }

    let active = true;
    setLookupLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api(`/users/lookup?email=${encodeURIComponent(email)}`);
        if (active) setLookup(data);
      } catch {
        if (active) setLookup(null);
      } finally {
        if (active) setLookupLoading(false);
      }
    }, 380);

    return () => {
      active = false;
      clearTimeout(timer);
      setLookupLoading(false);
    };
  }, [toEmail]);

  const cents = parseAmountToCents(amount);
  const feeCents = lookupFee(cents, lookup?.member);
  const totalCents = cents ? cents + feeCents : 0;
  const isSelf = Boolean(lookup?.isSelf);
  const isMember = Boolean(lookup?.member);
  const insufficient = Boolean(totalCents && totalCents > (user?.balanceCents || 0));

  const balanceAfter = useMemo(
    () => (user?.balanceCents || 0) - totalCents,
    [user, totalCents],
  );

  function validate() {
    const next = {};
    const email = toEmail.trim().toLowerCase();
    if (!email) next.toEmail = 'Enter the recipient’s email address.';
    else if (!EMAIL_PATTERN.test(email)) next.toEmail = 'Enter a valid email address.';
    else if (isSelf) next.toEmail = 'You can’t send money to your own account.';
    if (!cents || cents < 100) next.amount = 'Enter an amount of at least $1.00.';
    else if (cents > 5000000) next.amount = 'Transfers are limited to $50,000.00.';
    else if (insufficient) next.amount = 'Your balance is too low to cover this transfer.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  }

  async function confirmTransfer() {
    setSubmitting(true);
    try {
      const data = await api('/transfers', {
        method: 'POST',
        body: {
          toEmail: toEmail.trim().toLowerCase(),
          toName: toName.trim(),
          amountCents: cents,
          note: note.trim(),
        },
      });
      setResult(data);
      updateUser({ ...user, balanceCents: data.balanceCents });
      window.dispatchEvent(new Event('paylune:wallet-updated'));
      toast.success(`${usd(data.amountCents)} sent to ${data.recipient.name}.`);
      setConfirmOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setResult(null);
    setToEmail('');
    setToName('');
    setAmount('');
    setNote('');
    setLookup(null);
    setErrors({});
  }

  const recipientName = lookup?.member ? lookup.name : toName.trim();

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-ink/35">Transfers</p>
        <h1 className="app-title mt-2">Send money</h1>
        <p className="app-subtitle mt-1.5">
          Move money to any email address. Paylune members receive it instantly, fee-free.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <form onSubmit={handleSubmit} className="card min-w-0 p-5 sm:p-7" noValidate>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-[#F7F8F1] px-4 py-3">
            <span className="text-[12px] text-slate-ink">Available balance</span>
            <span className="numeric text-[13px] font-semibold text-ink">
              {usd(user?.balanceCents || 0)}
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <Field
              label="Recipient email"
              htmlFor="recipient-email"
              error={errors.toEmail}
              hint={
                lookup?.isSelf
                  ? undefined
                  : 'Paylune members are found automatically.'
              }
            >
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                <input
                  id="recipient-email"
                  type="email"
                  autoComplete="off"
                  value={toEmail}
                  onChange={(event) => {
                    setToEmail(event.target.value);
                    if (errors.toEmail) setErrors((current) => ({ ...current, toEmail: '' }));
                  }}
                  placeholder="name@company.com"
                  className={cx('input pl-11', errors.toEmail && 'border-red-300')}
                />
                {lookupLoading ? (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Spinner className="h-4 w-4 text-ink/35" label="Looking up recipient" />
                  </span>
                ) : null}
              </div>
            </Field>

            {lookup && !lookup.isSelf ? (
              <div
                className={cx(
                  'flex items-center gap-3 rounded-xl border px-3.5 py-3',
                  lookup.member
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : 'border-ink/[0.08] bg-[#FBFCF7]',
                )}
              >
                <Avatar name={lookup.member ? lookup.name : recipientName || toEmail} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {lookup.member ? lookup.name : recipientName || toEmail.split('@')[0]}
                  </p>
                  <p className="truncate text-[11px] text-slate-ink">
                    {lookup.member
                      ? `Paylune member${lookup.company ? ` · ${lookup.company}` : ''}`
                      : 'External recipient · pays a 1% transfer fee'}
                  </p>
                </div>
                <span
                  className={cx(
                    'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold',
                    lookup.member
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-ink/[0.05] text-ink/55',
                  )}
                >
                  {lookup.member ? 'Instant · Free' : '1% fee'}
                </span>
              </div>
            ) : null}

            {lookup?.isSelf ? (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[12px] text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                This is your own Paylune account. Choose a different recipient.
              </div>
            ) : null}

            {contacts.length ? (
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-ink/35">
                  Recent recipients
                </p>
                <div className="flex flex-wrap gap-2">
                  {contacts.map((contact) => (
                    <button
                      key={contact.email}
                      type="button"
                      onClick={() => {
                        setToEmail(contact.email);
                        setErrors((current) => ({ ...current, toEmail: '' }));
                      }}
                      className={cx(
                        'inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[11.5px] font-medium transition',
                        toEmail.toLowerCase() === contact.email.toLowerCase()
                          ? 'border-ink/30 bg-[#F7F8F1] text-ink'
                          : 'border-ink/[0.08] bg-white text-ink/60 hover:border-ink/20 hover:text-ink',
                      )}
                    >
                      <Avatar name={contact.name} size="xs" />
                      {contact.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {!isMember && EMAIL_PATTERN.test(toEmail.trim()) && !isSelf ? (
              <Field
                label="Recipient name"
                htmlFor="recipient-name"
                hint="Optional — we’ll use their email name if left blank."
              >
                <input
                  id="recipient-name"
                  type="text"
                  autoComplete="off"
                  value={toName}
                  onChange={(event) => setToName(event.target.value)}
                  placeholder="e.g. Priya Nair"
                  className="input"
                />
              </Field>
            ) : null}

            <div>
              <label htmlFor="amount" className="field-label">
                Amount
              </label>
              <div
                className={cx(
                  'flex items-center rounded-2xl border bg-white px-4 transition focus-within:ring-4 focus-within:ring-lime/40',
                  errors.amount ? 'border-red-300' : 'border-ink/10 focus-within:border-ink/25',
                )}
              >
                <span className="font-display text-[28px] font-medium text-ink/35">$</span>
                <input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => {
                    const cleaned = event.target.value
                      .replace(/[^\d.]/g, '')
                      .replace(/(\..*)\./g, '$1')
                      .replace(/^(\d*\.?\d{0,2}).*$/, '$1');
                    setAmount(cleaned);
                    if (errors.amount) setErrors((current) => ({ ...current, amount: '' }));
                  }}
                  placeholder="0.00"
                  className="numeric h-[68px] w-0 min-w-0 flex-1 bg-transparent px-2 font-display text-[34px] font-semibold tracking-[-0.04em] text-ink outline-none placeholder:text-ink/20"
                />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/35">
                  USD
                </span>
              </div>
              {errors.amount ? (
                <p className="mt-1.5 text-[12px] font-medium text-red-600">{errors.amount}</p>
              ) : null}
              <div className="mt-2.5 flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => {
                      setAmount(quick);
                      if (errors.amount) setErrors((current) => ({ ...current, amount: '' }));
                    }}
                    className={cx(
                      'rounded-full border px-3 py-1.5 text-[11px] font-semibold transition',
                      amount === quick
                        ? 'border-ink bg-ink text-cream'
                        : 'border-ink/10 bg-white text-ink/60 hover:border-ink/25 hover:text-ink',
                    )}
                  >
                    ${Number(quick).toLocaleString('en-US')}
                  </button>
                ))}
                {insufficient ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-medium text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    Not enough balance
                  </span>
                ) : null}
              </div>
            </div>

            <Field
              label="Note"
              htmlFor="note"
              hint={`${note.length}/160 · optional, visible to the recipient`}
            >
              <textarea
                id="note"
                rows={3}
                maxLength={160}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What’s this for? e.g. Brand sprint deposit"
                className="textarea"
              />
            </Field>
          </div>

          <div className="mt-6 rounded-xl border border-ink/[0.06] bg-[#FBFCF7] px-4 py-1">
            <div className="flex items-center justify-between border-b border-ink/[0.06] py-3 text-[12.5px]">
              <span className="text-slate-ink">Transfer fee</span>
              <span className="numeric font-medium text-ink">
                {feeCents === 0 ? (isMember ? 'Free' : '$0.00') : usd(feeCents)}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 text-[13px]">
              <span className="font-medium text-ink">Total to pay</span>
              <span className="numeric font-semibold text-ink">{totalCents ? usd(totalCents) : '—'}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={lookupLoading || !cents}
            className="btn btn-dark mt-5 w-full py-3.5"
          >
            <Send className="h-4 w-4" />
            Continue to review
          </button>
        </form>

        <aside className="min-w-0 space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-ink p-5 text-cream sm:p-6">
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-lime/15 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime text-ink">
                <Sparkles className="h-[18px] w-[18px]" />
              </span>
              <h2 className="mt-4 font-display text-[20px] font-semibold tracking-[-0.03em]">
                Free between members
              </h2>
              <p className="mt-1.5 text-[12px] leading-5 text-cream/45">
                Transfers to Paylune accounts settle instantly, with no fee and no minimum.
              </p>
              <ul className="mt-5 space-y-3 text-[11.5px] text-cream/60">
                {[
                  { icon: ShieldCheck, text: 'Recipient confirmed automatically' },
                  { icon: Clock3, text: 'Instant settlement, 24/7' },
                  { icon: Users, text: 'Send to any email worldwide' },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-2.5">
                    <item.icon className="h-3.5 w-3.5 shrink-0 text-lime/80" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">Fees, upfront</h2>
            <div className="mt-3 space-y-3 text-[11.5px] leading-5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-slate-ink">To a Paylune member</span>
                <span className="shrink-0 font-semibold text-emerald-700">Free</span>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-ink/[0.05] pt-3">
                <span className="text-slate-ink">To an external account</span>
                <span className="shrink-0 font-semibold text-ink">1% · min $0.25</span>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-ink/[0.05] pt-3">
                <span className="text-slate-ink">Delivery</span>
                <span className="shrink-0 font-semibold text-ink">Instant</span>
              </div>
            </div>
            <div className="pt-4">
              <InlineNote>
                <span className="inline-flex items-start gap-1.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  This is a demo. No real funds are debited or delivered.
                </span>
              </InlineNote>
            </div>          </div>

          <div className="rounded-2xl border border-ink/[0.07] bg-white p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink/35">
              Need to receive instead?
            </p>
            <p className="mt-1.5 text-[12.5px] leading-5 text-slate-ink">
              Create a payment link and share it with anyone.
            </p>
            <Link
              to="/app/payment-links"
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink transition hover:gap-2.5"
            >
              Create a link
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!submitting) setConfirmOpen(false);
        }}
        title="Review transfer"
        description="Check the details before you send."
        size="sm"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
              className="btn btn-light flex-1"
            >
              Go back
            </button>
            <button
              type="button"
              onClick={confirmTransfer}
              disabled={submitting}
              className="btn btn-dark flex-1"
            >
              {submitting ? <Spinner /> : <Send className="h-4 w-4" />}
              {submitting ? 'Sending…' : `Send ${usd(cents)}`}
            </button>
          </div>
        }
      >
        <div className="flex flex-col items-center pb-2 text-center">
          <Avatar name={recipientName || toEmail} size="xl" />
          <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.12em] text-slate-ink">
            Sending to
          </p>
          <p className="mt-1 text-[15px] font-semibold text-ink">{recipientName || toEmail}</p>
          <p className="text-[12px] text-slate-ink">{toEmail.trim().toLowerCase()}</p>
          <p className="numeric mt-4 font-display text-[36px] font-semibold tracking-[-0.04em] text-ink">
            {usd(cents)}
          </p>
          {note.trim() ? (
            <p className="mt-1 max-w-xs text-[12px] leading-5 text-slate-ink">“{note.trim()}”</p>
          ) : null}
        </div>

        <div className="mt-4 rounded-2xl border border-ink/[0.06] bg-[#FBFCF7] px-4 py-1 text-[13px]">
          <div className="flex items-center justify-between border-b border-ink/[0.06] py-3">
            <span className="text-slate-ink">Transfer fee</span>
            <span className="numeric font-medium text-ink">
              {feeCents === 0 ? 'Free' : usd(feeCents)}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-ink/[0.06] py-3">
            <span className="text-slate-ink">Total paid</span>
            <span className="numeric font-medium text-ink">{usd(totalCents)}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-slate-ink">Balance after</span>
            <span className="numeric font-medium text-ink">{usd(balanceAfter)}</span>
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-slate-ink">
          <ShieldCheck className="h-3.5 w-3.5" />
          Simulated transfer — this cannot be reversed.
        </p>
      </Modal>

      <Modal
        open={Boolean(result)}
        onClose={resetForm}
        title="Transfer sent"
        description={result?.transaction.reference}
        size="sm"
        footer={
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={resetForm} className="btn btn-light flex-1">
              Send another
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/transactions')}
              className="btn btn-dark flex-1"
            >
              View transactions
            </button>
          </div>
        }
      >
        {result ? (
          <div className="text-center">
            <span className="animate-pop mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-7 w-7" strokeWidth={1.8} />
            </span>
            <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.12em] text-slate-ink">
              Sent to {result.recipient.name}
            </p>
            <p className="numeric mt-1 font-display text-[36px] font-semibold tracking-[-0.04em] text-ink">
              {usd(result.amountCents)}
            </p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-emerald-700">
              <Check className="h-3.5 w-3.5" />
              {result.recipient.member ? 'Delivered instantly · No fee' : 'External transfer · on its way'}
            </p>

            <div className="mt-5 rounded-2xl border border-ink/[0.06] bg-[#FBFCF7] px-4 py-1 text-left text-[13px]">
              <div className="flex items-center justify-between border-b border-ink/[0.06] py-3">
                <span className="text-slate-ink">Recipient</span>
                <span className="max-w-[60%] truncate font-medium text-ink">
                  {result.recipient.email}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-ink/[0.06] py-3">
                <span className="text-slate-ink">Fee</span>
                <span className="numeric font-medium text-ink">
                  {result.feeCents === 0 ? 'Free' : usd(result.feeCents)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-ink/[0.06] py-3">
                <span className="text-slate-ink">Total paid</span>
                <span className="numeric font-medium text-ink">{usd(result.totalCents)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-slate-ink">Reference</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink">
                  {result.transaction.reference}
                  <CopyButton
                    value={result.transaction.reference}
                    showLabel={false}
                    className="inline-grid h-6 w-6 place-items-center rounded-md text-ink/40 transition hover:bg-ink/5 hover:text-ink"
                  />
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
