import { Modal, Badge, CopyButton } from './ui';
import { formatDateTime, usdAbs } from '../lib/format';
import { transactionMeta, transactionTypeLabel } from './TransactionItem';

function DetailRow({ label, children, border = true }) {
  return (
    <div
      className={
        border
          ? 'flex items-start justify-between gap-6 border-b border-ink/[0.06] py-3 text-[13px]'
          : 'flex items-start justify-between gap-6 py-3 text-[13px]'
      }
    >
      <span className="text-slate-ink">{label}</span>
      <span className="text-right font-medium text-ink">{children}</span>
    </div>
  );
}

export default function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) return null;

  const meta = transactionMeta(transaction);
  const Icon = meta.icon;
  const incoming = transaction.amountCents > 0;
  const total = Math.abs(transaction.amountCents);
  const fee = transaction.feeCents || 0;
  const sentAmount = total - fee;
  const isSend = transaction.type === 'send';

  let headline = 'You received';
  if (transaction.type === 'topup') headline = 'Money added';
  else if (isSend) headline = 'You sent';
  else if (transaction.type === 'withdrawal') headline = 'You withdrew';
  else if (transaction.type === 'card') headline = 'Card payment';

  return (
    <Modal
      open
      onClose={onClose}
      title="Transaction receipt"
      description={transaction.reference}
      size="sm"
      footer={
        <button type="button" onClick={onClose} className="btn btn-dark w-full">
          Done
        </button>
      }
    >
      <div className="flex flex-col items-center pb-6 pt-2 text-center">
        <span className={`grid h-12 w-12 place-items-center rounded-full ${meta.iconClass}`}>
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <p className="mt-4 text-[12px] font-medium uppercase tracking-[0.12em] text-slate-ink">
          {headline}
        </p>
        <p className="numeric mt-1.5 font-display text-[34px] font-semibold tracking-[-0.04em] text-ink">
          {incoming ? '+' : '−'}
          {usdAbs(transaction.amountCents)}
        </p>
        <p className="mt-1 text-[13px] font-medium text-ink">
          {transaction.counterpartyName || meta.titlePrefix}
        </p>
        <Badge tone="success" className="mt-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {transaction.status === 'completed' ? 'Completed' : transaction.status}
        </Badge>
      </div>

      <div className="rounded-2xl border border-ink/[0.06] bg-[#FBFCF7] px-4 py-1">
        <DetailRow label="Date & time">{formatDateTime(transaction.createdAt)}</DetailRow>
        <DetailRow label="Type">{transactionTypeLabel(transaction)}</DetailRow>
        <DetailRow label="Counterparty">
          {transaction.counterpartyEmail ? (
            <span>
              <span className="block">{transaction.counterpartyName}</span>
              <span className="block text-[12px] font-normal text-slate-ink">
                {transaction.counterpartyEmail}
              </span>
            </span>
          ) : (
            transaction.counterpartyName || '—'
          )}
        </DetailRow>
        {isSend && fee > 0 ? (
          <>
            <DetailRow label="Amount sent">{usdAbs(sentAmount)}</DetailRow>
            <DetailRow label="Paylune fee">{usdAbs(fee)}</DetailRow>
          </>
        ) : null}
        <DetailRow label={isSend ? 'Total paid' : 'Amount'}>
          {usdAbs(isSend ? total : sentAmount)}
        </DetailRow>
        <DetailRow label="Reference" border={false}>
          <span className="inline-flex items-center gap-2">
            <span className="font-mono text-[12px] tracking-tight">{transaction.reference}</span>
            <CopyButton
              value={transaction.reference}
              showLabel={false}
              className="inline-grid h-6 w-6 place-items-center rounded-md text-ink/40 transition hover:bg-ink/5 hover:text-ink"
            />
          </span>
        </DetailRow>
      </div>

      {transaction.description ? (
        <div className="mt-4 rounded-xl bg-lime/20 px-4 py-3 text-[12px] leading-5 text-ink/70">
          <span className="font-semibold text-ink">Note:</span> {transaction.description}
        </div>
      ) : null}
    </Modal>
  );
}
