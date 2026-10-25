import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Plus,
  ReceiptText,
  Search,
  Send,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import Logo from './Logo';
import AddMoneyModal from './AddMoneyModal';
import { Avatar } from './ui';
import { useAuth } from '../context/AuthContext';
import { cx } from '../lib/format';

const NAV_ITEMS = [
  { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
  { label: 'Send money', to: '/app/send', icon: Send },
  { label: 'Transactions', to: '/app/transactions', icon: ReceiptText },
  { label: 'Cards', to: '/app/cards', icon: CreditCard },
  { label: 'Payment links', to: '/app/payment-links', icon: Link2 },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="px-6 pb-7 pt-6">
        <Logo theme="dark" to="/app" />
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-lime/15 bg-lime/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-lime/80">
          <span className="h-1.5 w-1.5 rounded-full bg-lime" />
          Demo workspace
        </div>
      </div>

      <nav className="flex-1 px-3" aria-label="Main navigation">
        <p className="mb-2 px-3.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-cream/25">
          Workspace
        </p>
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cx(
                    'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-white/[0.09] text-cream'
                      : 'text-cream/50 hover:bg-white/[0.04] hover:text-cream/90',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cx(
                        'h-[17px] w-[17px] transition-colors',
                        isActive ? 'text-lime' : 'text-cream/35 group-hover:text-cream/70',
                      )}
                      strokeWidth={1.8}
                    />
                    {item.label}
                    {isActive ? (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-lime" />
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        <p className="mb-2 mt-7 px-3.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-cream/25">
          Account
        </p>
        <NavLink
          to="/app/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cx(
              'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-colors duration-150',
              isActive
                ? 'bg-white/[0.09] text-cream'
                : 'text-cream/50 hover:bg-white/[0.04] hover:text-cream/90',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings
                className={cx(
                  'h-[17px] w-[17px] transition-colors',
                  isActive ? 'text-lime' : 'text-cream/35 group-hover:text-cream/70',
                )}
                strokeWidth={1.8}
              />
              Settings
            </>
          )}
        </NavLink>
      </nav>

      <div className="px-4 pb-5 pt-4">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-cream/80">
            <ShieldCheck className="h-3.5 w-3.5 text-lime/80" />
            Demo mode
          </div>
          <p className="mt-1.5 text-[10.5px] leading-4 text-cream/35">
            All balances and payments are simulated. No real money moves.
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
          <Link
            to="/app/settings"
            onClick={onNavigate}
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1 py-0.5"
          >
            <Avatar name={user?.name} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-[12px] font-medium text-cream/90">
                {user?.name}
              </span>
              <span className="block truncate text-[10px] text-cream/35">{user?.email}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-cream/35 transition hover:bg-white/[0.06] hover:text-cream"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-[15px] w-[15px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [search, setSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  function handleSearch(event) {
    event.preventDefault();
    const term = search.trim();
    navigate(term ? `/app/transactions?q=${encodeURIComponent(term)}` : '/app/transactions');
  }

  return (
    <div className="min-h-dvh bg-cream text-ink">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] overflow-hidden bg-ink lg:block">
        <div
          className="pointer-events-none absolute -left-24 -top-28 h-72 w-72 rounded-full bg-lime/[0.07] blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.06) 0.8px, transparent 0.8px)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(to bottom, black, transparent 40%)',
          }}
          aria-hidden="true"
        />
        <div className="relative h-full">
          <SidebarContent />
        </div>
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="animate-fade-in absolute inset-0 bg-ink/55 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="animate-slide-in relative h-full w-[286px] max-w-[86vw] bg-ink shadow-2xl">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full text-cream/50 transition hover:bg-white/10 hover:text-cream"
              aria-label="Close menu"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex min-h-dvh flex-col lg:pl-[264px]">
        <header className="sticky top-0 z-30 border-b border-ink/[0.06] bg-cream/90 backdrop-blur-xl">
          <div className="flex h-[70px] items-center gap-2.5 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="icon-btn -ml-1 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="lg:hidden">
              <Logo theme="light" size="sm" to="/app" />
            </div>

            <form onSubmit={handleSearch} className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions…"
                className="h-10 w-[210px] rounded-full border border-ink/[0.08] bg-white pl-10 pr-4 text-[12.5px] text-ink outline-none transition placeholder:text-ink/35 focus:border-ink/20 focus:ring-4 focus:ring-lime/30 xl:w-[280px]"
                aria-label="Search transactions"
              />
            </form>

            <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
              <span className="hidden items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink/45 xl:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Demo mode
              </span>
              <button
                type="button"
                onClick={() => setAddMoneyOpen(true)}
                className="btn btn-dark btn-sm h-[38px] px-3.5 sm:px-4"
                aria-label="Add money"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">Add money</span>
              </button>
              <Link
                to="/app/settings"
                className="rounded-full ring-offset-2 ring-offset-cream transition hover:ring-2 hover:ring-ink/10"
                aria-label="Account settings"
              >
                <Avatar name={user?.name} size="sm" />
              </Link>
            </div>
          </div>
        </header>

        <main className="page-x flex-1 py-6 sm:py-8">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet context={{ openAddMoney: () => setAddMoneyOpen(true) }} />
          </div>
        </main>

        <footer className="page-x pb-6 pt-2 text-center text-[10.5px] text-ink/35 lg:pb-5 lg:text-left">
          Paylune is a product demo — balances and payments are simulated.
        </footer>
      </div>

      <AddMoneyModal open={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
    </div>
  );
}
