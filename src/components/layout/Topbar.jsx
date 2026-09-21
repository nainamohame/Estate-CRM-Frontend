import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IconMenu, IconSearch, IconClock } from '../ui/icons';
import { api } from '../../lib/api';
import { useAuth } from '../../features/auth/useAuth';

export function Topbar({ title, onOpenMobileNav }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ['follow-ups', { scope: 'overdue' }],
    queryFn: () => api.get('/follow-ups', { scope: 'overdue' }).then((r) => r.data),
    refetchInterval: 5 * 60 * 1000,
  });
  const overdueCount = data?.length ?? 0;

  return (
    <header className="sticky top-0 z-20 flex h-topbar shrink-0 items-center justify-between gap-4 border-b border-border bg-surface/85 backdrop-blur-md px-4 lg:px-6">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
        >
          <IconMenu size={20} />
        </button>
        <h1 className="text-md font-semibold text-fg truncate tracking-[-0.01em]">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/leads')}
          className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-surface-muted/70 px-3 py-1.5 text-sm text-fg-subtle shadow-xs transition-colors hover:border-border-strong hover:text-fg"
        >
          <IconSearch size={14} />
          <span>Search leads…</span>
        </button>

        <button
          onClick={() => navigate('/follow-ups?scope=overdue')}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
          aria-label={`${overdueCount} overdue follow-ups`}
        >
          <IconClock size={18} />
          {overdueCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-600 px-1 text-[0.625rem] font-semibold text-white ring-2 ring-surface tabular-nums">
              {overdueCount > 9 ? '9+' : overdueCount}
            </span>
          )}
        </button>

        <span className="hidden sm:block h-5 w-px bg-border" />
        <span className="hidden sm:flex items-center gap-2 text-sm">
          <span className="text-fg-muted">{user?.fullName?.split(' ')[0]}</span>
        </span>
      </div>
    </header>
  );
}
