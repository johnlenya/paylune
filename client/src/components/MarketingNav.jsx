import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';
import { cx } from '../lib/format';

const LINKS = [
  { label: 'Product', href: '/#product' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'FAQ', href: '/#faq' },
];

export default function MarketingNav() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open
          ? 'border-b border-white/[0.07] bg-ink/90 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="marketing-x flex h-[76px] items-center justify-between gap-6">
        <Logo theme="dark" to="/" />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Marketing">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="group relative text-[13px] font-medium text-cream/55 transition-colors hover:text-cream"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-lime transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                to="/app"
                className="hidden text-[13px] font-medium text-cream/60 transition hover:text-cream sm:block"
              >
                Dashboard
              </Link>
              <Link to="/app" className="btn btn-primary btn-sm px-4">
                Open app
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden px-3 py-2 text-[13px] font-medium text-cream/60 transition hover:text-cream sm:block"
              >
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm px-4">
                Get started
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="grid h-10 w-10 place-items-center rounded-full text-cream/75 transition hover:bg-white/[0.06] md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="animate-fade-in border-t border-white/[0.07] bg-ink/95 backdrop-blur-xl md:hidden">
          <div className="marketing-x py-5">
            <div className="space-y-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 text-[14px] font-medium text-cream/70 transition hover:bg-white/[0.05] hover:text-cream"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/[0.07] pt-4">
              <Link
                to={user ? '/app' : '/login'}
                onClick={() => setOpen(false)}
                className="btn btn-outline justify-center"
              >
                {user ? 'Dashboard' : 'Sign in'}
              </Link>
              <Link
                to={user ? '/app/send' : '/signup'}
                onClick={() => setOpen(false)}
                className="btn btn-primary justify-center"
              >
                {user ? 'Send money' : 'Get started'}
              </Link>
            </div>
            <p className="mt-4 text-center text-[10px] text-cream/30">
              Demo product · Simulated funds only
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
