import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Gift } from 'lucide-react';
import AuthShell from '../components/AuthShell';
import { Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function Signup() {
  useDocumentTitle('Create account');
  const { user, ready, signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (ready && user) return <Navigate to="/app" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 8) {
      setError('Your password needs to be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await signup(name.trim(), email.trim(), password);
      navigate('/app', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <p className="eyebrow text-ink/35">Open an account</p>
      <h1 className="mt-3 font-display text-[34px] font-semibold leading-tight tracking-[-0.045em] text-ink">
        Create your Paylune.
      </h1>
      <p className="mt-2 text-[13px] leading-6 text-slate-ink">
        Start moving money in under a minute. No card required.
      </p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-lime-dark/25 bg-lime/35 px-3 py-1.5 text-[11px] font-medium text-[#405A18]">
        <Gift className="h-3.5 w-3.5" />
        New demo accounts start with $1,000 in simulated funds
      </div>

      <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
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
          <label htmlFor="name" className="field-label">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Alex Mwangi"
            className="input"
          />
        </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
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
          <p className="mt-1.5 text-[11px] text-slate-ink">Use 8 or more characters.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary mt-1 w-full py-3.5"
        >
          {submitting ? <Spinner /> : null}
          {submitting ? 'Creating your account…' : 'Create account'}
        </button>

        <p className="text-center text-[10.5px] leading-4 text-ink/35">
          By continuing, you agree to the demo{' '}
          <Link
            to="/legal/terms"
            className="underline decoration-ink/20 underline-offset-2 hover:text-ink/60"
          >
            terms
          </Link>{' '}
          and{' '}
          <Link
            to="/legal/privacy"
            className="underline decoration-ink/20 underline-offset-2 hover:text-ink/60"
          >
            privacy policy
          </Link>
          . No real money is involved.
        </p>
      </form>

      <p className="mt-6 text-center text-[11.5px] text-slate-ink">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4 transition hover:decoration-ink"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
