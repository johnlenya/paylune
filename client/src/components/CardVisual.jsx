import { Snowflake, Wifi } from 'lucide-react';
import { cx } from '../lib/format';
import { LogoMark } from './Logo';

const themes = {
  obsidian: {
    wrap: 'border-white/10 bg-[radial-gradient(125%_145%_at_6%_0%,#2A3F30_0%,#0D1711_52%,#1A2A1F_100%)] text-cream',
    subtle: 'text-cream/45',
    line: 'border-white/15',
    orbit: 'border-white/[0.08]',
    brandDark: false,
  },
  lime: {
    wrap: 'border-ink/10 bg-[radial-gradient(125%_150%_at_0%_0%,#EDFFB2_0%,#C9F65D_46%,#A9DE42_100%)] text-ink',
    subtle: 'text-ink/50',
    line: 'border-ink/15',
    orbit: 'border-ink/[0.08]',
    brandDark: true,
  },
  violet: {
    wrap: 'border-white/10 bg-[radial-gradient(130%_150%_at_0%_0%,#7161E8_0%,#3B2F7A_52%,#211A45_100%)] text-cream',
    subtle: 'text-cream/45',
    line: 'border-white/15',
    orbit: 'border-white/[0.09]',
    brandDark: false,
  },
  coral: {
    wrap: 'border-white/10 bg-[radial-gradient(130%_150%_at_0%_0%,#FFB389_0%,#F37A50_45%,#A93720_100%)] text-cream',
    subtle: 'text-cream/55',
    line: 'border-white/20',
    orbit: 'border-white/[0.1]',
    brandDark: false,
  },
};

function BrandMark({ brand, darkText }) {
  if (brand === 'mastercard') {
    return (
      <span className="flex items-center" aria-label="Mastercard">
        <span
          className={cx(
            'h-[19px] w-[19px] rounded-full',
            darkText ? 'bg-ink/75' : 'bg-[#FF5F00]',
          )}
        />
        <span
          className={cx(
            '-ml-2 h-[19px] w-[19px] rounded-full opacity-85',
            darkText ? 'bg-ink/35' : 'bg-[#FFB347]',
          )}
        />
      </span>
    );
  }
  return (
    <span
      className="font-display text-[17px] font-bold italic tracking-[0.06em]"
      aria-label="Visa"
    >
      VISA
    </span>
  );
}

export default function CardVisual({ card, className = '', showLabel = true }) {
  const theme = themes[card.color] || themes.obsidian;
  const brandDark = theme.brandDark;

  return (
    <div
      className={cx(
        'relative aspect-[1.62/1] w-full overflow-hidden rounded-[22px] border p-5 shadow-[0_24px_50px_-28px_rgba(8,16,11,0.55)] sm:p-6',
        theme.wrap,
        className,
      )}
    >
      <div
        className={cx(
          'pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border',
          theme.orbit,
        )}
        aria-hidden="true"
      />
      <div
        className={cx(
          'pointer-events-none absolute -right-5 -top-10 h-32 w-32 rounded-full border',
          theme.orbit,
        )}
        aria-hidden="true"
      />
      <div
        className={cx(
          'pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full',
          brandDark ? 'bg-white/15' : 'bg-white/[0.035]',
        )}
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <LogoMark className="h-5 w-5 rounded-[6px]" />
            <span className="font-display text-[13px] font-semibold tracking-[-0.03em]">
              paylune
            </span>
          </div>
          <span
            className={cx(
              'rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.16em]',
              theme.line,
              theme.subtle,
            )}
          >
            Virtual
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="relative grid h-[25px] w-[33px] place-items-center overflow-hidden rounded-[5px] bg-[linear-gradient(135deg,#F7E7AE,#D4B36D)]">
            <span className="h-[13px] w-[22px] rounded-[2px] border border-[#8C6D31]/45" />
            <span className="absolute inset-x-0 top-1/2 h-px bg-[#8C6D31]/40" />
          </span>
          <Wifi className="h-[17px] w-[17px] rotate-90 opacity-50" strokeWidth={1.7} />
        </div>

        <div>
          <p className="numeric text-[14px] font-medium tracking-[0.14em] sm:text-[15px]">
            <span className={theme.subtle}>••••&nbsp;&nbsp;••••&nbsp;&nbsp;••••&nbsp;&nbsp;</span>
            {card.last4}
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div className="min-w-0">
              {showLabel ? (
                <p className="truncate text-[10px] font-medium uppercase tracking-[0.12em] opacity-95">
                  {card.label}
                </p>
              ) : null}
              <p className={cx('mt-0.5 text-[9px] uppercase tracking-[0.13em]', theme.subtle)}>
                Exp {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
              </p>
            </div>
            <BrandMark brand={card.brand} darkText={brandDark} />
          </div>
        </div>
      </div>

      {card.frozen ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-[inherit] bg-ink/45 text-cream backdrop-blur-[3px]">
          <Snowflake className="h-5 w-5" />
          <span className="text-[12px] font-semibold tracking-wide">Card frozen</span>
        </div>
      ) : null}
    </div>
  );
}
