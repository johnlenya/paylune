import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Landmark,
  Plus,
} from 'lucide-react';
import { Badge } from './ui';
import { cx, relativeDay, usdAbs } from '../lib/format';
const typeMeta = {
  receive: {
    icon: ArrowDownLeft,
    iconClass: 'bg-[#EAF7D3] text-[#47631B]',
    label: 'Transfer in',
    titlePrefix: 'Received from',
  },
  send: {
    icon: ArrowUpRight,
    iconClass: 'bg-[#F0F1E9] text-ink/65',
    label: 'Transfer out',
    titlePrefix: 'Sent to',
  },
  payment_link: {
    icon: ArrowDownLeft,
    iconClass: 'bg-[#E3F7F0] text-[#146B53]',
    label: 'Payment link',
    titlePrefix: 'Payment from',
  },
  topup: {
    icon: Plus,
    iconClass: 'bg-[#E8EFFF] text-[#3156A0]',
    label: 'Top-up',
    titlePrefix: 'Added from',
  },
  withdrawal: {
    icon: Landmark,
    iconClass: 'bg-[#FCF0E7] text-[#9A532D]',
    label: 'Withdrawal',
    titlePrefix: 'Withdrawal to',
  },
  card: {
    icon: CreditCard,
    iconClass: 'bg-[#F0ECFA] text-[#6248A8]',
    label: 'Card payment',
    titlePrefix: 'Card payment',
  },
};

export function transactionMeta(transaction) {
  return typeMeta[transaction.type] || typeMeta.send;
}

export function transactionTypeLabel(transaction) {
  return typeMeta[transaction.type]?.label || 'Transaction';
}

export default function TransactionItem({
  transaction,
  onClick,
  className = '',
  showStatus = false,
}) {
  const meta = transactionMeta(transaction);
  const Icon = meta.icon;
  const incoming = transaction.amountCents > 0;
  const title = transaction.counterpartyName || meta.label;
  const subtitle = transaction.description || meta.label;

  const content = (
    <>
      <span
        className={cx(
          'grid h-10 w-10 shrink-0 place-items-center rounded-full',
          meta.iconClass,
        )}
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-ink">{title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-slate-ink">
          {subtitle}
          {transaction.feeCents > 0 ? ` · fee ${usdAbs(transaction.feeCents)}` : ''}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span
          className={cx(
            'numeric block text-[13.5px] font-semibold',
            incoming ? 'text-emerald-700' : 'text-ink',
          )}
        >
          {incoming ? '+' : '−'}
          {usdAbs(transaction.amountCents)}
        </span>
        <span className="mt-0.5 flex items-center justify-end gap-1.5 text-[11px] text-slate-ink">
          {showStatus && transaction.status !== 'completed' ? (
            <Badge tone="neutral" className="px-1.5 py-0.5 text-[9px]">
              {transaction.status}
            </Badge>
          ) : null}
          {relativeDay(transaction.createdAt)}
        </span>
      </span>
    </>
  );

  const classes = cx(
    'flex w-full items-center gap-3 text-left transition-colors duration-150',
    onClick && 'hover:bg-[#F7F8F1]',
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={() => onClick(transaction)} className={classes}>
        {content}
      </button>
    );
  }

  return <div className={classes}>{content}</div>;
}
