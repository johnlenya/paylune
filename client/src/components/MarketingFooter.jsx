import { Link } from 'react-router-dom';
import { Globe2, Mail } from 'lucide-react';
import Logo from './Logo';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/#features' },
      { label: 'Pricing', to: '/#pricing' },
      { label: 'Security', to: '/#security' },
      { label: 'Create an account', to: '/signup' },
    ],
  },
  {
    title: 'Live demo',
    links: [
      { label: 'Dashboard', to: '/app' },
      { label: 'Send money', to: '/app/send' },
      { label: 'Payment links', to: '/app/payment-links' },
      { label: 'Virtual cards', to: '/app/cards' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Demo account', to: '/login' },
      { label: 'Contact', href: 'mailto:hello@paylune.app' },
      { label: 'Legal', to: '/legal/terms' },
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.07] bg-ink">
      <div className="marketing-x py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo theme="dark" to="/" />
            <p className="mt-5 text-[13px] leading-6 text-cream/45">
              A borderless money account for freelancers, creators, and remote teams. Send,
              receive, and spend — without the friction.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-cream/40">
                <Globe2 className="h-3 w-3" /> USD · English
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-cream/40">
                <span className="h-1.5 w-1.5 rounded-full bg-lime/70" /> Demo build
              </span>
            </div>
            <a
              href="mailto:hello@paylune.app"
              className="mt-5 inline-flex items-center gap-2 text-[12px] text-cream/40 transition hover:text-cream/70"
            >
              <Mail className="h-3.5 w-3.5" /> hello@paylune.app
            </a>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/30">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        className="text-[12.5px] text-cream/50 transition hover:text-cream"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-[12.5px] text-cream/50 transition hover:text-cream"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.07] pt-6 text-[10.5px] leading-4 text-cream/30 sm:flex-row sm:items-start sm:justify-between">
          <p>© {new Date().getFullYear()} Paylune Labs. A fictional product, built as a demonstration.</p>
          <p className="max-w-md sm:text-right">
            Paylune is not a bank, money transmitter, or licensed payment provider. No real
            funds are held, transferred, or insured. All balances shown in the demo are simulated.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10.5px] text-cream/30">
          <Link to="/legal/privacy" className="transition hover:text-cream/60">
            Privacy
          </Link>
          <Link to="/legal/terms" className="transition hover:text-cream/60">
            Terms
          </Link>
          <Link to="/legal/notice" className="transition hover:text-cream/60">
            Demo notice
          </Link>
        </div>
      </div>
    </footer>
  );
}
