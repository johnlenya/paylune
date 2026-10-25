import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  LogOut,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Avatar, Field, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { api } from '../lib/api';
import { formatDate, usd } from '../lib/format';

export default function Settings() {
  useDocumentTitle('Settings');
  const { user, updateUser, logout, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [country, setCountry] = useState(user?.country || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setCompany(user?.company || '');
    setCountry(user?.country || '');
  }, [user?.name, user?.company, user?.country]);

  const dirty =
    name !== (user?.name || '') ||
    company !== (user?.company || '') ||
    country !== (user?.country || '');

  async function handleSubmit(event) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    setSaving(true);
    try {
      const data = await api('/me', {
        method: 'PATCH',
        body: { name: name.trim(), company: company.trim(), country: country.trim() },
      });
      updateUser(data.user);
      await refreshUser();
      toast.success('Profile updated.');
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-ink/35">Account</p>
        <h1 className="app-title mt-2">Settings</h1>
        <p className="app-subtitle mt-1.5">
          Manage your profile and demo account preferences.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <form onSubmit={handleSubmit} className="card p-5 sm:p-7" noValidate>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-[19px] font-semibold tracking-[-0.03em] text-ink">
                Profile
              </h2>
              <p className="mt-0.5 text-[12px] text-slate-ink">
                This is how you appear to people you pay.
              </p>
            </div>
            <Avatar name={name || user?.name} size="lg" />
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12px] text-red-700"
            >
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="settings-name" className="sm:col-span-2">
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                <input
                  id="settings-name"
                  type="text"
                  autoComplete="name"
                  maxLength={60}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (error) setError('');
                  }}
                  className="input pl-11"
                />
              </div>
            </Field>

            <Field
              label="Email address"
              htmlFor="settings-email"
              hint="Email changes aren’t available in the demo."
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/25" />
                <input
                  id="settings-email"
                  type="email"
                  value={user?.email || ''}
                  readOnly
                  className="input cursor-not-allowed bg-[#F7F8F1] pl-11 text-ink/50"
                />
              </div>
            </Field>

            <Field label="Company" htmlFor="settings-company" hint="Optional · shown on receipts.">
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                <input
                  id="settings-company"
                  type="text"
                  autoComplete="organization"
                  maxLength={60}
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="e.g. Northwind Studio"
                  className="input pl-11"
                />
              </div>
            </Field>

            <Field label="Country" htmlFor="settings-country" className="sm:col-span-2">
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                <input
                  id="settings-country"
                  type="text"
                  autoComplete="country-name"
                  maxLength={60}
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder="e.g. Kenya"
                  className="input pl-11"
                />
              </div>
            </Field>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-ink/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-ink">
              {dirty ? 'You have unsaved changes.' : 'All changes saved.'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setName(user?.name || '');
                  setCompany(user?.company || '');
                  setCountry(user?.country || '');
                  setError('');
                }}
                disabled={!dirty || saving}
                className="btn btn-light btn-sm"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={!dirty || saving}
                className="btn btn-dark btn-sm min-w-[110px]"
              >
                {saving ? <Spinner /> : null}
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <section className="relative overflow-hidden rounded-2xl bg-ink p-5 text-cream sm:p-6">
            <div
              className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-lime/15 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative flex items-start gap-3">
              <Avatar name={user?.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-display text-[17px] font-semibold tracking-[-0.02em]">
                  {user?.name}
                </p>
                <p className="truncate text-[11px] text-cream/45">{user?.email}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-lime/20 bg-lime/10 px-2.5 py-1 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-lime">
                  <Sparkles className="h-2.5 w-2.5" />
                  Demo account
                </span>
              </div>
            </div>

            <div className="relative mt-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <span className="text-[11px] text-cream/40">Available balance</span>
                <span className="numeric text-[13px] font-semibold">{usd(user?.balanceCents || 0)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <span className="text-[11px] text-cream/40">Plan</span>
                <span className="text-[11.5px] font-medium">Demo · unlimited</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-cream/40">Member since</span>
                <span className="text-[11.5px] font-medium">
                  {user?.createdAt ? formatDate(user.createdAt) : '—'}
                </span>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-ink/55" />
              <h2 className="font-display text-[15px] font-semibold text-ink">Security</h2>
            </div>
            <div className="mt-3 space-y-3 text-[11.5px]">
              <div className="flex items-center justify-between border-b border-ink/[0.05] pb-3">
                <span className="text-slate-ink">Password</span>
                <span className="font-medium text-ink">••••••••</span>
              </div>
              <div className="flex items-center justify-between border-b border-ink/[0.05] pb-3">
                <span className="text-slate-ink">Two-factor auth</span>
                <span className="text-ink/40">Not in demo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-ink">Session</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
              </div>
            </div>
            <p className="mt-4 text-[10.5px] leading-4 text-slate-ink">
              This demo stores data locally. Never reuse a real password.
            </p>
          </section>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-between rounded-2xl border border-ink/[0.07] bg-white px-5 py-4 text-left transition hover:border-red-200 hover:bg-red-50/50"
          >
            <span className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
              <LogOut className="h-4 w-4 text-ink/45" />
              Sign out
            </span>
            <span className="text-[11px] text-ink/30">End demo session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
