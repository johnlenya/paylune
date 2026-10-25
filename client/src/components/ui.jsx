import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, LoaderCircle, X } from 'lucide-react';
import { avatarStyle, cx, initials } from '../lib/format';
import { copyText } from '../lib/clipboard';
import Logo from './Logo';

const avatarSizes = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ name = '', size = 'md', className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-grid shrink-0 place-items-center rounded-full font-semibold uppercase tracking-[0.02em]',
        avatarSizes[size],
        avatarStyle(name || 'Paylune'),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

const badgeTones = {
  neutral: 'border border-ink/[0.06] bg-ink/[0.04] text-ink/60',
  lime: 'bg-lime/75 text-[#3d5517]',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-600',
  outline: 'border border-ink/10 bg-transparent text-ink/60',
  dark: 'bg-ink text-cream',
};

export function Badge({ children, tone = 'neutral', className = '' }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none',
        badgeTones[tone] || badgeTones.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className = '', label = 'Loading' }) {
  return (
    <span role="status" className="inline-flex">
      <LoaderCircle className={cx('h-4 w-4 animate-spin', className)} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoaderScreen({ label = 'Loading your account' }) {
  return (
    <div className="grid min-h-dvh place-items-center bg-cream text-ink">
      <div className="flex flex-col items-center gap-5">
        <Logo theme="light" size="lg" />
        <span className="flex items-center gap-2 text-[13px] font-medium text-slate-ink">
          <Spinner className="h-4 w-4 text-ink" label={label} />
          {label}
        </span>
      </div>
    </div>
  );
}

const modalSizes = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => {
      if (dialogRef.current && !dialogRef.current.contains(document.activeElement)) {
        dialogRef.current.focus();
      }
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="animate-fade-in absolute inset-0 bg-ink/55 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key !== 'Tab' || !dialogRef.current) return;
          const focusable = dialogRef.current.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
          if (!focusable.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }}
        className={cx(
          'modal-pop relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-white text-ink shadow-lift outline-none sm:rounded-[28px]',
          modalSizes[size] || modalSizes.md,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink/[0.06] px-6 py-5">
          <div>
            <h2 id={titleId} className="text-[21px] font-semibold tracking-[-0.03em] text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[13px] leading-5 text-slate-ink">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-btn -mr-1 -mt-1 h-9 w-9 shrink-0"
            aria-label="Close dialog"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-ink/[0.06] bg-[#FBFCF7] px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center px-6 py-14 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-lime/55 text-ink">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <h3 className="text-[17px] font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-slate-ink">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Field({ label, htmlFor, hint, error, children, className = '' }) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={htmlFor} className="field-label">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-[12px] font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-slate-ink">{hint}</p>
      ) : null}
    </div>
  );
}

export function CopyButton({
  value,
  label = 'Copy',
  className = 'btn btn-light btn-sm',
  showLabel = true,
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  async function handleCopy() {
    const success = await copyText(value);
    if (!success) return;
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button type="button" onClick={handleCopy} className={className} aria-live="polite">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {showLabel ? <span>{copied ? 'Copied' : label}</span> : null}
    </button>
  );
}

export function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-[22px] w-10 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-ink' : 'bg-ink/15',
      )}
    >
      <span
        className={cx(
          'inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[21px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  );
}

export function InlineNote({ children, tone = 'neutral' }) {
  return (
    <div
      className={cx(
        'rounded-xl border px-3.5 py-3 text-[12px] leading-5',
        tone === 'warning'
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : 'border-ink/[0.07] bg-[#F7F8F1] text-slate-ink',
      )}
    >
      {children}
    </div>
  );
}
