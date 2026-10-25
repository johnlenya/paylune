import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function Login() {
  useDocumentTitle('Sign in');
  const { user, ready, login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/app';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  if (ready && user) return <Navigate to={destination} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDemo() {
    setError('');
    setDemoLoading(true);
    try {
      await demoLogin();
      navigate('/app', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <AuthShell>
      <div className="mb-8 flex items-center justify-between gap-3 rounded-2xl border border-ink/[0.07] bg-white p-3.5 shadow-soft">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-lime text-ink">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-ink">Just exploring?</p>
            <p className="text-[11px] text-slate-ink">The demo account is already funded.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDemo}
          disabled={demoLoading}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-[11px] font-semibold text-ink transition hover:border-ink/25 hover:bg-sand/50 disabled:opacity-50"
        >
          {demoLoading ? <Spinner className="h-3 w-3" /> : 'Try demo'}
          {!demoLoading ? <ArrowRight className="h-3 w-3" /> : null}
        </button>
      </div>

      <p className="eyebrow text-ink/35">Welcome back</p>
      <h1 className="mt-3 font-display text-[34px] font-semibold leading-tight tracking-[-0.045em] text-ink">
        Sign in to Paylune.
      </h1>
      <p className="mt-2 text-[13px] leading-6 text-slate-ink">
        Pick up where you left off. Your money moves are waiting.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12px] leading-5 text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="field-label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="password" className="field-label">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="input pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink/35 transition hover:bg-ink/5 hover:text-ink/70"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary mt-1 w-full py-3.5"
        >
          {submitting ? <Spinner /> : null}
          {submitting ? 'Signing you in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 text-center text-[11.5px] text-slate-ink">
        New to Paylune?{' '}
        <Link
          to="/signup"
          className="font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4 transition hover:decoration-ink"
        >
          Create an account
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-ink/[0.06] px-4 py-3 text-center">
        <p className="text-[10px] uppercase tracking-[0.15em] text-ink/30">Demo credentials</p>
        <p className="mt-1 font-mono text-[11px] text-ink/50">demo@paylune.app · demo1234</p>
      </div>
    </AuthShell>
  );
}
