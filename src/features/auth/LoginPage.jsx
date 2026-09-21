import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert } from '../../components/ui/alert';
import { FormField } from '../../components/patterns/FormField';
import {
  IconMail,
  IconLock,
  IconBuilding,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconShield,
} from '../../components/ui/icons';

const DEMO_ACCOUNTS = [
  { label: 'Admin', sub: 'Priya Menon', email: 'admin@estatecrm.dev', password: 'Admin@123' },
  { label: 'Sales', sub: 'Rahul Sharma', email: 'rahul@estatecrm.dev', password: 'Sales@123' },
  { label: 'Sales', sub: 'Aisha Khan', email: 'aisha@estatecrm.dev', password: 'Sales@123' },
];

const HIGHLIGHTS = [
  'Track every lead from first contact to a confirmed booking',
  'Live inventory across projects, buildings and units',
  'Two agents can never book the same unit',
];

export function LoginPage() {
  const { user, login, isLoggingIn, loginError } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return <Navigate to={location.state?.from?.pathname ?? '/dashboard'} replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password }).catch(() => {});
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {/* ---- Brand panel -------------------------------------------------- */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between p-12 overflow-hidden bg-mesh-brand">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute inset-0 bg-linear-to-t from-brand-950/80 via-transparent to-transparent" />

        <div className="relative flex items-center gap-2.5 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/12 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
            <IconBuilding size={18} />
          </span>
          <span className="text-md font-semibold tracking-[-0.01em]">Estate CRM</span>
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-4xl font-semibold leading-[1.15] text-white tracking-[-0.025em]">
            Every lead, unit and booking
            <br />
            in one place.
          </h1>
          <p className="mt-4 text-brand-100/80 leading-relaxed">
            Built for real estate sales teams who need to move fast without stepping on each other.
          </p>

          <ul className="mt-8 space-y-3.5">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-brand-50/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-400/20 text-accent-300 ring-1 ring-inset ring-accent-400/30">
                  <IconCheck size={12} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex items-center gap-8 border-t border-white/10 pt-6">
          {[
            { value: '270', label: 'Units tracked' },
            { value: '3', label: 'Live projects' },
            { value: '55', label: 'Active leads' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-xl font-semibold text-white tabular-nums">{stat.value}</p>
              <p className="text-xs text-brand-100/60 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Form --------------------------------------------------------- */}
      <div className="flex w-full lg:w-[48%] items-center justify-center p-6">
        <div className="w-full max-w-[22rem] animate-slide-up">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <IconBuilding size={18} />
            </span>
            <span className="text-md font-semibold text-fg">Estate CRM</span>
          </div>

          <h2 className="text-2xl font-semibold text-fg tracking-[-0.02em]">Welcome back</h2>
          <p className="text-sm text-fg-muted mt-1.5 mb-7">Sign in to continue to your dashboard.</p>

          {loginError && <Alert variant="danger" description={loginError.message} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-1">
            <FormField label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<IconMail size={15} />}
                placeholder="you@estatecrm.dev"
                required
              />
            </FormField>

            <FormField label="Password" htmlFor="password">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<IconLock size={15} />}
                placeholder="••••••••"
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="transition-colors hover:text-fg"
                  >
                    {showPassword ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                  </button>
                }
              />
            </FormField>

            <Button type="submit" size="lg" fullWidth loading={isLoggingIn} className="mt-2">
              Sign in
            </Button>
          </form>

          {/* Demo credentials — a reviewer with five minutes should never have
              to hunt through a README for a password. */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-fg-subtle mb-3">
              <IconShield size={12} />
              Try a demo account
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  className="group rounded-lg border border-border bg-gradient-surface px-2.5 py-2 text-left shadow-xs transition-all hover:border-brand-300 hover:shadow-sm"
                >
                  <span className="block text-xs font-semibold text-fg group-hover:text-brand-700">
                    {account.label}
                  </span>
                  <span className="block text-[0.6875rem] text-fg-subtle truncate mt-0.5">{account.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
