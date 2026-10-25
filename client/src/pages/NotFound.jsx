import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  const { user } = useAuth();

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-ink text-cream">
      <div
        className="pointer-events-none absolute inset-0 grid-fade opacity-70"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-lime/10 blur-3xl"
        aria-hidden="true"
      />
      <header className="relative z-10">
        <div className="marketing-x flex h-[76px] items-center justify-between">
          <Logo theme="dark" to="/" />
          <Link
            to={user ? '/app' : '/login'}
            className="text-[13px] font-medium text-cream/60 transition hover:text-cream"
          >
            {user ? 'Dashboard' : 'Sign in'}
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-16">
        <div className="max-w-lg text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-lime">
            <Compass className="h-6 w-6" />
          </span>
          <p className="mt-6 font-display text-[84px] font-semibold leading-none tracking-[-0.06em] text-lime">
            404
          </p>
          <h1 className="mt-4 font-display text-[30px] font-semibold tracking-[-0.04em] text-cream">
            This page missed the transfer.
          </h1>
          <p className="mt-3 text-[13.5px] leading-6 text-cream/45">
            The link may be broken, or the page may have moved. Your balance is safe — it’s still
            exactly where you left it.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Link to="/" className="btn btn-primary">
              Back to home
            </Link>
            <Link to={user ? '/app' : '/login'} className="btn btn-outline">
              {user ? 'Open dashboard' : 'Sign in to demo'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-10 pb-6 text-center text-[10.5px] text-cream/25">
        Paylune is a product demo — balances and payments are simulated.
      </footer>
    </div>
  );
}
