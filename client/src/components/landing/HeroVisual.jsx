import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Link2,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { Avatar } from '../ui';

function Sparkline() {
  return (
    <svg
      viewBox="0 0 240 54"
      preserveAspectRatio="none"
      className="h-12 w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9F65D" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#C9F65D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 40 C 14 38 20 28 34 30 S 52 36 66 29 S 84 14 96 19 S 118 32 132 24 S 152 12 164 16 S 186 28 200 18 S 224 8 240 10 L 240 54 L 0 54 Z"
        fill="url(#hero-spark)"
      />
      <path
        d="M0 40 C 14 38 20 28 34 30 S 52 36 66 29 S 84 14 96 19 S 118 32 132 24 S 152 12 164 16 S 186 28 200 18 S 224 8 240 10"
        fill="none"
        stroke="#C9F65D"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="240" cy="10" r="2.6" fill="#C9F65D" />
    </svg>
  );
}

function MiniTransaction({ name, note, amount, incoming, delay }) {
  return (
    <div
      className="flex items-center gap-2.5 py-2"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Avatar name={name} size="xs" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-cream/90">{name}</p>
        <p className="truncate text-[9.5px] text-cream/35">{note}</p>
      </div>
      <p
        className={`numeric text-[10.5px] font-semibold ${
          incoming ? 'text-lime' : 'text-cream/70'
        }`}
      >
        {incoming ? '+' : '−'}
        {amount}
      </p>
    </div>
  );
}

export default function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[540px] pb-16 pt-4 sm:pb-20">
      <div
        className="pointer-events-none absolute -right-12 top-6 h-[440px] w-[440px] rounded-full border border-white/[0.06]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-4 top-24 h-[290px] w-[290px] rounded-full border border-lime/[0.1]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-10 top-20 h-2.5 w-2.5 rounded-full bg-lime/80"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-10 bottom-32 h-24 w-24 rounded-full bg-lime/[0.07] blur-2xl"
        aria-hidden="true"
      />

      <div className="animate-fade-up relative z-10 mt-10 rounded-[26px] border border-white/[0.09] bg-[linear-gradient(150deg,#152219_0%,#0D1711_58%,#0A120D_100%)] p-5 shadow-[0_44px_90px_-40px_rgba(0,0,0,0.9)] sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 rounded-[26px] opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.055) 0.7px, transparent 0.7px)',
            backgroundSize: '18px 18px',
            maskImage: 'linear-gradient(to bottom, black, transparent 65%)',
          }}
          aria-hidden="true"
        />

        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-lime">
                <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
                  <circle cx="13.5" cy="17.2" r="8" fill="#08100B" />
                  <circle cx="19.8" cy="11.6" r="7.2" fill="#C9F65D" />
                  <circle cx="24.3" cy="8.2" r="1.7" fill="#08100B" />
                </svg>
              </span>
              <div>
                <p className="text-[10px] font-medium text-cream/80">Northwind Studio</p>
                <p className="text-[8.5px] text-cream/30">Business account</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[8px] font-semibold tracking-[0.12em] text-cream/40">
                USD
              </span>
              <button
                type="button"
                className="grid h-6 w-6 place-items-center rounded-full text-cream/30"
                aria-label="More options"
                tabIndex={-1}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-1.5 text-[10.5px] text-cream/40">
            Available balance
            <Eye className="h-3 w-3 text-cream/25" />
          </div>
          <p className="numeric mt-1 font-display text-[38px] font-semibold leading-none tracking-[-0.05em] text-cream sm:text-[43px]">
            $24,860<span className="text-cream/35">.40</span>
          </p>

          <div className="mt-4">
            <Sparkline />
          </div>

          <div className="mt-3 flex items-center gap-4 text-[9.5px]">
            <span className="inline-flex items-center gap-1.5 text-cream/35">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              In
              <span className="numeric font-semibold text-cream/75">$8,450.00</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-cream/35">
              <span className="h-1.5 w-1.5 rounded-full bg-cream/25" />
              Out
              <span className="numeric font-semibold text-cream/75">$2,314.80</span>
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="flex items-center justify-center gap-1.5 rounded-xl bg-lime py-2.5 text-[10px] font-semibold text-ink">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Send
            </div>
            <div className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.09] bg-white/[0.03] py-2.5 text-[10px] font-medium text-cream/75">
              <Plus className="h-3.5 w-3.5 text-cream/45" />
              Add money
            </div>
            <div className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.09] bg-white/[0.03] py-2.5 text-[10px] font-medium text-cream/75">
              <Link2 className="h-3.5 w-3.5 text-cream/45" />
              Get paid
            </div>
          </div>

          <div className="mt-5 border-t border-white/[0.07] pt-1">
            <div className="flex items-center justify-between py-1.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-cream/25">
                Recent activity
              </p>
              <span className="flex items-center gap-1 text-[9px] text-cream/30">
                <span className="h-1 w-1 animate-pulse rounded-full bg-lime" />
                Live demo
              </span>
            </div>
            <MiniTransaction
              name="Lumen Labs"
              note="Website redesign"
              amount="$6,200.00"
              incoming
              delay={120}
            />
            <MiniTransaction
              name="Aisha Bello"
              note="Contractor payout"
              amount="$1,200.00"
              delay={220}
            />
          </div>
        </div>
      </div>

      <div className="animate-float absolute left-0 top-0 z-20 w-[218px] rounded-2xl border border-ink/[0.06] bg-white p-3 text-ink shadow-lift sm:-left-7 sm:w-[238px]">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#EAF7D3] text-[#47631B]">
            <ArrowDownLeft className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-semibold">Payment received</p>
            <p className="truncate text-[9px] text-ink/40">Kite Studio · just now</p>
          </div>
          <p className="numeric shrink-0 text-[10.5px] font-semibold text-emerald-700">
            +$2,450
          </p>
        </div>
      </div>

      <div className="animate-float-delayed absolute bottom-2 right-0 z-20 w-[238px] rotate-[1.5deg] rounded-2xl bg-lime p-3.5 text-ink shadow-lift sm:-right-5 sm:w-[258px]">
        <div className="flex items-center justify-between">
          <span className="text-[8.5px] font-semibold uppercase tracking-[0.15em] text-ink/45">
            Payment link
          </span>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-ink/10">
            <Link2 className="h-3 w-3" />
          </span>
        </div>
        <p className="mt-2 text-[12px] font-semibold">Brand sprint — deposit</p>
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg bg-ink/[0.08] px-2.5 py-2">
          <span className="truncate font-mono text-[8.5px] text-ink/55">
            paylune.app/pay/brand…
          </span>
          <span className="numeric text-[11px] font-semibold">$1,450</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[8px] text-ink/40">
          <span className="h-1 w-1 rounded-full bg-ink/40" /> 3 payments this week
        </div>
      </div>

      <div className="absolute -bottom-1 left-2 z-20 hidden items-center gap-2 rounded-full border border-white/10 bg-pine/90 py-1.5 pl-1.5 pr-3 backdrop-blur sm:flex">
        <div className="flex -space-x-1.5">
          <Avatar name="Aisha Bello" size="xs" className="ring-2 ring-pine" />
          <Avatar name="Daniel Kim" size="xs" className="ring-2 ring-pine" />
          <Avatar name="Maya Chen" size="xs" className="ring-2 ring-pine" />
        </div>
        <span className="text-[9px] text-cream/45">Trusted by borderless teams</span>
      </div>
    </div>
  );
}
