import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Logo from './Logo';
import { Avatar } from './ui';

export default function AuthShell({ children }) {
  return (
    <div className="min-h-dvh bg-cream text-ink lg:grid lg:grid-cols-[44%_56%]">
      <aside className="relative hidden overflow-hidden bg-ink px-10 py-9 lg:flex lg:flex-col xl:px-14">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_20%_0%,rgba(201,246,93,0.14),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="grid-fade pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-28 top-20 h-[420px] w-[420px] rounded-full border border-white/[0.07]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-4 top-44 h-[260px] w-[260px] rounded-full border border-lime/[0.12]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-24 top-36 h-3 w-3 rounded-full bg-lime"
          aria-hidden="true"
        />

        <div className="relative z-10">
          <Logo theme="dark" to="/" />
        </div>

        <div className="relative z-10 my-auto max-w-[430px] py-12">
          <p className="eyebrow text-lime/75">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" />
            Borderless money
          </p>
          <h1 className="mt-5 text-balance font-display text-[42px] font-semibold leading-[1.04] tracking-[-0.05em] text-cream xl:text-[48px]">
            Get paid anywhere.
            <br />
            <span className="text-lime">Move like it’s local.</span>
          </h1>
          <p className="mt-5 max-w-sm text-[13.5px] leading-6 text-cream/45">
            One account for client payments, team payouts, and cards. Built for work
            that ignores time zones.
          </p>

          <div className="mt-10 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-sm">
            <div className="flex gap-1" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((star) => (
                <span key={star} className="text-[11px] text-lime">
                  ★
                </span>
              ))}
            </div>
            <p className="mt-3 text-[13px] leading-6 text-cream/65">
              “Paid by clients in four countries without a single bank branch visit. It’s the
              account I always wanted as a freelancer.”
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar name="Aisha Bello" size="sm" />
              <div>
                <p className="text-[11.5px] font-medium text-cream/85">Aisha Bello</p>
                <p className="text-[10px] text-cream/35">Founder, Bello Studio</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-[10.5px] text-cream/35">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-lime/60" /> Instant transfers
            </span>
            <span>140+ countries</span>
            <span>Bank-level security</span>
          </div>
        </div>

        <p className="relative z-10 text-[10px] text-cream/25">
          Demo experience — all funds, cards, and payments are simulated.
        </p>
      </aside>

      <main className="flex min-h-dvh flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo theme="light" to="/" />
          </div>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-medium text-ink/45 transition hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>

        <p className="text-center text-[10px] text-ink/30">
          Demo product · No real money moves
        </p>
      </main>
    </div>
  );
}
